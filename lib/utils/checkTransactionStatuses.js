import { updateTransaction } from 'lib/services/updateTransaction'
import { chainIdToNetworkName } from 'lib/utils/chainIdToNetworkName'

// import { getRevertReason } from 'lib/utils/getRevertReason'
const getRevertReason = require('eth-revert-reason')

export const checkTransactionStatuses = (
  localStorageTransactions,
  provider,
  transactions,
  setTransactions
) => {
  localStorageTransactions = localStorageTransactions
    .filter((tx) => tx.sent && !tx.completed)
    .map((tx) => runAsyncCheckTx(tx, provider, localStorageTransactions, setTransactions))
}

const runAsyncCheckTx = async (tx, provider, transactions, setTransactions) => {
  let ethersTx
  try {
    ethersTx = await provider.getTransaction(tx.hash)

    await ethersTx.wait()

    updateTransaction(
      tx.id,
      {
        ethersTx,
        // reason,
        // error: reason.length > 0,
        completed: true,
      },
      transactions,
      setTransactions
    )
  } catch (e) {
    if (e.message.match('transaction failed')) {
      const networkName = chainIdToNetworkName(ethersTx.chainId)
      let reason
      if (networkName !== 'rinkeby') {
        reason = await getRevertReason(tx.hash, networkName)
      }

      updateTransaction(
        tx.id,
        {
          ethersTx,
          reason,
          error: true,
          completed: true,
        },
        transactions,
        setTransactions
      )
    } else {
      console.error(e)
    }

    if (!ethersTx) {
      updateTransaction(
        tx.id,
        {
          reason: 'Failed to send, could not find transaction on blockchain',
          error: true,
          completed: true,
        },
        transactions,
        setTransactions
      )
    }
  }
}
