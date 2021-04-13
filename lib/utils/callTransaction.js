import { ethers } from 'ethers'

import { V2_CONTRACT_ADDRESSES } from 'lib/constants'
import { updateTransaction } from 'lib/services/updateTransaction'
import { chainIdToNetworkName } from 'lib/utils/chainIdToNetworkName'
import { poolToast } from 'lib/utils/poolToast'

const debug = require('debug')('pool-app:callTransaction')

const getRevertReason = require('eth-revert-reason')
const bn = ethers.BigNumber.from

// this could be smart enough to know which ABI to use based on
// the contract address
export const callTransaction = async (
  t,
  transactions,
  setTransactions,
  tx,
  provider,
  usersAddress,
  contractAbi,
  contractAddress,
  method,
  params = [],
  value = 0
) => {
  let ethersTx

  let updatedTransactions = transactions

  const signer = provider.getSigner()

  const contract = new ethers.Contract(contractAddress, contractAbi, signer)

  const nextNonce = await provider.getTransactionCount(usersAddress, 'pending')

  const fxn = Object.values(contract.interface.functions).find((fn) => fn.name === method)

  let gasLimit
  const lastParam = params[params.length - 1]
  const includesGasLimitParam =
    typeof lastParam === 'object' && lastParam.hasOwnProperty('gasLimit')
  if (includesGasLimitParam) {
    gasLimit = params.pop().gasLimit
  }

  const data = contract.interface.encodeFunctionData(fxn, params)

  const chainId = provider.network.chainId
  let transactionRequest = {
    to: contractAddress,
    nonce: nextNonce,
    value,
    data,
    chainId
  }

  let gasEstimate
  try {
    gasEstimate = await contract.estimateGas[method](...params)
  } catch (e) {
    console.warn(`error while estimating gas: `, e)
  }

  if (includesGasLimitParam) {
    transactionRequest.gasLimit = gasLimit
  } else if (gasEstimate) {
    const gasMultiplier = 1.15
    transactionRequest.gasLimit = parseInt(gasEstimate.toNumber() * gasMultiplier, 10)
  }

  try {
    // using the lower level `Signer#sendTransaction` API here
    // since the basic 'contract.method()' (ie.
    // const ethersTx = await contract[method].apply(null, params))
    // one was intermittently
    // failing to get the nonce on Kovan w/ MetaMask
    debug('sending tx', transactionRequest)
    ethersTx = await signer.sendTransaction(transactionRequest)

    updatedTransactions = updateTransaction(
      tx.id,
      {
        ethersTx,
        sent: true,
        inWallet: false,
        hash: ethersTx.hash
      },
      updatedTransactions,
      setTransactions
    )

    // Transaction sent! Confirming...
    poolToast.success(
      <>
        {tx.name}
        <br /> {t('transactionSentConfirming')}
      </>
    )
    await ethersTx.wait()

    updatedTransactions = updateTransaction(
      tx.id,
      {
        ethersTx,
        completed: true
      },
      updatedTransactions,
      setTransactions
    )

    poolToast.rainbow(
      <>
        {tx.name}
        <br /> {t('transactionSuccessful')}
      </>
    )
  } catch (e) {
    console.error(e.message)

    if (e?.message?.match('User denied transaction signature')) {
      updatedTransactions = updateTransaction(
        tx.id,
        {
          cancelled: true,
          completed: true
        },
        updatedTransactions,
        setTransactions
      )

      poolToast.warn(t('youCancelledTheTransaction'))
      // You cancelled the transaction
    } else {
      let reason, errorMsg

      try {
        if (ethersTx?.hash) {
          const networkName = chainIdToNetworkName(ethersTx.chainId)
          reason = await getRevertReason(ethersTx.hash, networkName)
        }
      } catch (error2) {
        console.error('Error getting revert reason')
        console.error(error2)
      }

      if (reason?.match('rng-in-flight')) {
        reason = t('prizeBeingAwardedPleaseTryAgainSoon')
        // 'Prize being awarded! Please try again soon'
      }

      errorMsg = reason ? reason : e.message

      if (!reason && e?.message?.match('transaction failed')) {
        errorMsg = t('transactionFailedUnknownError')
        // 'Transaction failed: unknown error'
      }

      updatedTransactions = updateTransaction(
        tx.id,
        {
          error: true,
          completed: true,
          reason: errorMsg,
          hash: ethersTx?.hash
        },
        updatedTransactions,
        setTransactions
      )

      // Failed to complete. Reason:
      poolToast.error(`${tx.name} - ${t('txFailedToCompleteWithReason')} ${errorMsg}`)
    }
  }
}
