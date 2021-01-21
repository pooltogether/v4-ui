import c from 'abis/DelegateableERC20ABI'
import DelegateableERC20ABI from 'abis/DelegateableERC20ABI'
import classnames from 'classnames'
import { useTranslation } from 'i18n/client'
import { useAtom } from 'jotai'
import { transactionsAtom } from 'lib/atoms/transactionsAtom'
import { Banner } from 'lib/components/Banner'
import { Button } from 'lib/components/Button'
import { AuthControllerContext } from 'lib/components/contextProviders/AuthControllerContextProvider'
import { V3LoadingDots } from 'lib/components/V3LoadingDots'
import { CONTRACT_ADDRESSES } from 'lib/constants'
import { useDelegateData } from 'lib/hooks/useDelegateData'
import { useSendTransaction } from 'lib/hooks/useSendTransaction'
import { useTokenHolder } from 'lib/hooks/useTokenHolder'
import { numberWithCommas } from 'lib/utils/numberWithCommas'
import React, { useContext, useState } from 'react'

export const UsersVotesCard = () => {
  const { usersAddress } = useContext(AuthControllerContext)
  const { data: tokenHolder, loading: tokenHolderIsLoading } = useTokenHolder(usersAddress)
  const { data: delegate, loading: delegateLoading } = useDelegateData(tokenHolder?.delegate?.id)

  if (
    !usersAddress ||
    tokenHolderIsLoading ||
    delegateLoading ||
    (!tokenHolder.hasBalance && !tokenHolder.hasDelegated)
  ) {
    return null
  }

  // TODO: actually need the number at the block prior to the proposals creation
  // depending on the page the user is currently viewing
  const votes = numberWithCommas(tokenHolder.tokenBalance)

  return (
    <Banner className='mb-4'>
      <h4 className='font-normal mb-4'>Total votes</h4>
      <div className='flex flex-col sm:flex-row'>
        <h2
          className={classnames('leading-none mr-4', {
            'opacity-30': !tokenHolder.hasDelegated,
          })}
        >
          {votes}
        </h2>
        <DelegateTrigger votes={votes} tokenHolder={tokenHolder} />
      </div>
    </Banner>
  )
}

const DelegateTrigger = (props) => {
  const { t } = useTranslation()
  const { tokenHolder, votes } = props
  const { hasDelegated, selfDelegated } = tokenHolder
  const { usersAddress, provider, chainId } = useContext(AuthControllerContext)
  const [txId, setTxId] = useState({})
  const [transactions, setTransactions] = useAtom(transactionsAtom)
  const [sendTx] = useSendTransaction(`Delegate`, transactions, setTransactions)
  const txInFlight = transactions?.find((tx) => tx.id === txId)

  const handleDelegate = async (e) => {
    e.preventDefault()

    const params = [usersAddress]

    const id = await sendTx(
      t,
      provider,
      usersAddress,
      DelegateableERC20ABI,
      CONTRACT_ADDRESSES[chainId].GovernanceToken,
      'delegate',
      params
    )
    setTxId(id)
  }

  if (txInFlight?.completed && !txInFlight?.error) {
    return (
      <p className='p-2 rounded bg-light-purple-35 text-green my-auto'>
        🎉 Successfully activated your votes 🎉
      </p>
    )
  }

  if (txInFlight?.completed && txInFlight?.error) {
    return (
      <>
        <p className='text-red mt-auto mr-2'>Error</p>
        <button type='button' className='underline trans mt-auto' onClick={handleDelegate}>
          Activate my votes
        </button>
      </>
    )
  }

  if (txInFlight?.inWallet) {
    return (
      <p className='mt-auto text-green opacity-80'>Please confirm the transaction in your wallet</p>
    )
  }

  if (txInFlight?.sent) {
    return <p className='mt-auto text-green opacity-80'>Waiting for confirmations...</p>
  }

  if (!hasDelegated) {
    return (
      <button type='button' className='underline trans mt-auto' onClick={handleDelegate}>
        Activate my votes
      </button>
    )
  }

  if (!selfDelegated) {
    return (
      <p className='mt-auto'>
        You have delegated <b>{votes}</b> votes to <b>{tokenHolder.delegate.id}</b>
      </p>
    )
  }

  return <p className='mt-auto'>You have {votes} for each proposal</p>
}
