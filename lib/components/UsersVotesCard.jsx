import React, { useContext, useState } from 'react'
import classnames from 'classnames'
import FeatherIcon from 'feather-icons-react'
import Link from 'next/link'

import { Trans, useTranslation } from 'lib/../i18n'
import { CONTRACT_ADDRESSES } from 'lib/constants'
import DelegateableERC20ABI from 'abis/DelegateableERC20ABI'
import { transactionsAtom } from 'lib/atoms/transactionsAtom'
import { AuthControllerContext } from 'lib/components/contextProviders/AuthControllerContextProvider'
import { Banner } from 'lib/components/Banner'
import { Button } from 'lib/components/Button'
import { EtherscanAddressLink } from 'lib/components/EtherscanAddressLink'
import { PTHint } from 'lib/components/PTHint'
import { SmallLoader } from 'lib/components/SmallLoader'
import { TxText } from 'lib/components/TxText'
import { useSendTransaction } from 'lib/hooks/useSendTransaction'
import { useSocialIdentity } from 'lib/hooks/useTwitterProfile'
import { useTokenHolder } from 'lib/hooks/useTokenHolder'
import { numberWithCommas, getPrecision } from 'lib/utils/numberWithCommas'
import { shorten } from 'lib/utils/shorten'
import { useTransaction } from 'lib/hooks/useTransaction'

const UsersVotesCardBlankState = (props) => {
  const { t } = useTranslation()

  return (
    <Banner className={classnames('mb-4')} style={{ color: 'white' }}>
      <div className='flex justify-between flex-col-reverse sm:flex-row'>
        <h5 className='font-normal mb-0 sm:mb-3'>{t('totalVotes')}</h5>
      </div>

      <div className='flex items-center lg:items-end'>
        <h2 className='mb-4 sm:mb-0 leading-none mr-0 sm:mr-4'>0</h2>

        <p className='text-accent-1 ml-4 mt-2'>
          {t('youCurrentlyHaveNoPoolToUseForVotingDescription')} <Link
            href='https://app.pooltogether.com'
            as='https://app.pooltogether.com'
          >
            <a className='text-highlight-2 hover:text-white underline trans trans-fast'>
              {t('getPoolFromDepositingInPools')}
            </a>
          </Link>
        </p>
      </div>
    </Banner>
  )
}

const UsersVotesCardConnectWallet = (props) => {
  const { t } = useTranslation()

  return (
    <Banner className={classnames('mb-4')} style={{ color: 'white' }}>
      <div className='flex justify-between flex-col-reverse sm:flex-row'>
        <h5 className='font-normal mb-0 sm:mb-3'>{t('totalVotes')}</h5>
      </div>
      <div className='flex flex-col'>
        {t('connectYourWalletToVote')}
        <Button
          secondary
          className='mt-3 xs:w-5/12 sm:w-1/3 lg:w-1/4'
          textSize='xxxs'
          onClick={() => props.connectWallet()}
        >
          {t('connectWallet')}
        </Button>
      </div>
    </Banner>
  )
}

export const UsersVotesCard = (props) => {
  const { blockNumber, className } = props

  const { t } = useTranslation()
  const { usersAddress, connectWallet } = useContext(AuthControllerContext)

  const {
    data: tokenHolder,
    isFetched: tokenHolderIsFetched,
    isDataFromBeforeCurrentBlock,
    refetch: refetchTokenHolderData
  } = useTokenHolder(
    // '0x7e4A8391C728fEd9069B2962699AB416628B19Fa', // Dharmas address for testing
    usersAddress,
    blockNumber
  )

  if (!usersAddress) {
    return <UsersVotesCardConnectWallet connectWallet={connectWallet} />
  }

  // TODO: This view is wrong for when we're looking at proposals in the past
  // TODO: After the polling comes back, the "Success" card gets cleared
  if (!tokenHolder || (!tokenHolder.hasBalance && !tokenHolder.hasDelegated)) {
    return <UsersVotesCardBlankState />
  }

  if (!tokenHolderIsFetched) {
    return <SmallLoader />
  }

  const votingPower = tokenHolder.selfDelegated
    ? numberWithCommas(tokenHolder.delegate.delegatedVotes, { precision: 0 })
    : numberWithCommas(tokenHolder.tokenBalance, { precision: 0 })

  return (
    <Banner className={classnames('mb-4', className)} style={{ color: 'white' }}>
      <div className='flex justify-between flex-col-reverse sm:flex-row'>
        <h5 className='font-normal mb-0 sm:mb-3'>{t('totalVotes')}</h5>
        {isDataFromBeforeCurrentBlock && (
          <div className='ml-auto sm:ml-0 mb-4 sm:mb-0 flex rounded px-4 py-1 w-fit-content h-fit-content bg-tertiary font-bold'>
            <FeatherIcon icon='alert-circle' className='mr-2 my-auto w-4 h-4' />
            {t('votingPowerIsLockedFromBlock', { blockNumber })}
          </div>
        )}
      </div>
      <div className='flex flex-col sm:flex-row'>
        <h2
          className={classnames('mb-4 sm:mb-0 leading-none mr-0 sm:mr-4', {
            'opacity-30': !tokenHolder.hasDelegated
          })}
        >
          {votingPower}
        </h2>
        <div className='flex'>
          <NotDelegatedWarning
            isDataFromBeforeCurrentBlock={isDataFromBeforeCurrentBlock}
            tokenHolder={tokenHolder}
          />

          <DelegateTrigger
            tokenHolder={tokenHolder}
            refetchTokenHolderData={refetchTokenHolderData}
            isDataFromBeforeCurrentBlock={isDataFromBeforeCurrentBlock}
          />
        </div>
      </div>
    </Banner>
  )
}

const NotDelegatedWarning = (props) => {
  const { tokenHolder, isDataFromBeforeCurrentBlock } = props

  const { t } = useTranslation()

  if (!isDataFromBeforeCurrentBlock || tokenHolder.hasDelegated) {
    return null
  }

  return (
    <div className='flex mb-1 mt-auto mr-2'>
      <PTHint
        tip={
          <div className='my-2 text-xs sm:text-sm break-words max-w-full'>
            {t('proposalCreatedPriorToDelegationDescription')}
          </div>
        }
      >
        <FeatherIcon icon='alert-circle' className='text-orange w-4 h-4' />
      </PTHint>
    </div>
  )
}

const DelegateTrigger = (props) => {
  const { tokenHolder, refetchTokenHolderData, isDataFromBeforeCurrentBlock } = props

  const { t } = useTranslation()
  const { hasDelegated, selfDelegated } = tokenHolder
  const { usersAddress, chainId } = useContext(AuthControllerContext)
  const [txId, setTxId] = useState(0)
  const sendTx = useSendTransaction()
  const { data: tokenHolderCurrentData, isFetched: tokenHolderIsFetched } = useTokenHolder(
    usersAddress
  )
  const tx = useTransaction(txId)

  const delegateAddress = tokenHolder?.delegate?.id
  const delegateIdentity = useSocialIdentity(delegateAddress)

  const tokenBalance = tokenHolder.tokenBalance
  const tokenBalanceDisplay = numberWithCommas(tokenBalance, { precision: getPrecision(tokenBalance) })

  const handleDelegate = async (e) => {
    e.preventDefault()

    const params = [usersAddress]

    const id = await sendTx(
      t('selfDelegate'),
      DelegateableERC20ABI,
      CONTRACT_ADDRESSES[chainId].GovernanceToken,
      'delegate',
      params,
      {
        refetch: refetchTokenHolderData
      }
    )
    setTxId(id)
  }

  if (tx?.completed && !tx?.error && !tx?.cancelled) {
    return (
      <p className='px-4 py-2 rounded-lg bg-light-purple-35 text-green my-auto font-bold'>
        🎉 {t('successfullyActivatedYourVotes')} 🎉
      </p>
    )
  }

  if (tx?.inWallet && !tx?.cancelled) {
    return <TxText>{t('pleaseConfirmInYourWallet')}</TxText>
  }

  if (tx?.sent) {
    return <TxText>{t('waitingForConfirmations')}...</TxText>
  }

  if (!hasDelegated || (tx?.completed && tx?.error)) {
    if (tokenHolderCurrentData && isDataFromBeforeCurrentBlock) {
      if (tokenHolderCurrentData.hasDelegated || !tokenHolderIsFetched) {
        return null
      }

      return (
        <button
          type='button'
          className='opacity-70 hover:opacity-100 text-highlight-9 hover:text-highlight-9 underline trans mt-auto font-bold'
          onClick={handleDelegate}
        >
          {t('activateMyVotesForFutureProposals')}
        </button>
      )
    }

    return (
      <button
        type='button'
        className='opacity-70 hover:opacity-100 text-highlight-9 hover:text-highlight-9 underline trans mt-auto font-bold'
        onClick={handleDelegate}
      >
        {t('activateMyVotes')}
      </button>
    )
  }

  if (!selfDelegated) {
    const twitterHandle = delegateIdentity?.twitter?.handle
    if (twitterHandle) {
      return (
        <p className='text-accent-1 mt-auto'>
          <Trans
            i18nKey='youHaveTokenDelegatedBalanceDelegatedTo'
            defaults='You have <bold>{{tokenBalanceDisplay}}</bold> votes delegated to'
            components={{
              bold: <span className='font-bold' />
            }}
            values={{
              tokenBalanceDisplay
            }}
          />{' '}
          <strong>
            <DelegateAddress address={delegateAddress} />
          </strong>
        </p>
      )
    }

    return (
      <p className='text-accent-1 mt-auto'>
        <Trans
          i18nKey='youHaveTokenDelegatedBalanceDelegatedTo'
          defaults='You have <bold>{{tokenBalanceDisplay}}</bold> votes delegated to'
          components={{
            bold: <span className='font-bold' />
          }}
          values={{
            tokenBalanceDisplay
          }}
        />{' '}
        <strong>
          <EtherscanAddressLink
            className='font-bold text-inverse hover:text-accent-1'
            address={delegateAddress}
          >
            <span className='hidden sm:inline'>{delegateAddress}</span>
            <span className='inline sm:hidden'>{shorten(delegateAddress)}</span>
          </EtherscanAddressLink>
        </strong>
      </p>
    )
  }

  const delegatedVotes = tokenHolder.delegate.delegatedVotes
  const delegatedVotesDisplay = numberWithCommas(delegatedVotes, { precision: getPrecision(delegatedVotes) })

  return (
    <p className='text-accent-1 mt-auto'>
      <Trans
        i18nKey='youHaveBalanceTokensAndDelegatedTokens'
        defaults='You have <bold>{{tokenBalanceDisplay}}</bold> tokens and <bold>{{delegatedVotesDisplay}}</bold> delegated votes'
        components={{
          bold: <span className='font-bold' />
        }}
        values={{
          tokenBalanceDisplay,
          delegatedVotesDisplay
        }}
      />
    </p>
  )
}

export const DelegateAddress = (props) => {
  const { address } = props
  const delegateIdentity = useSocialIdentity(address)
  const twitterHandle = delegateIdentity?.twitter?.handle

  if (twitterHandle) {
    return (
      <>
        <a
          className='text-inverse hover:text-accent-1 mr-2 trans'
          href={`https://twitter.com/${twitterHandle}`}
          target='_blank'
          rel='noopener'
        >
          {twitterHandle}
          <FeatherIcon icon='external-link' className='inline w-4 h-4 mb-1 ml-1' />
        </a>
        (
        <EtherscanAddressLink className='text-inverse hover:text-accent-1' address={address}>
          {shorten(address)}
        </EtherscanAddressLink>
        )
      </>
    )
  }

  return (
    <EtherscanAddressLink className='text-inverse hover:text-accent-1' address={address}>
      <span className='hidden sm:inline'>{address}</span>
      <span className='inline sm:hidden'>{shorten(address)}</span>
    </EtherscanAddressLink>
  )
}
