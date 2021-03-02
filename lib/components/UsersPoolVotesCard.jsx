import React, { useContext, useState } from 'react'
import classnames from 'classnames'
import FeatherIcon from 'feather-icons-react'
import Link from 'next/link'

import { Trans, useTranslation } from 'lib/../i18n'
import { CONTRACT_ADDRESSES } from 'lib/constants'
import DelegateableERC20ABI from 'abis/DelegateableERC20ABI'
import { AuthControllerContext } from 'lib/components/contextProviders/AuthControllerContextProvider'
import { Banner } from 'lib/components/Banner'
import { EtherscanAddressLink } from 'lib/components/EtherscanAddressLink'
import { PTHint } from 'lib/components/PTHint'
import { TxText } from 'lib/components/TxText'
import { useSendTransaction } from 'lib/hooks/useSendTransaction'
import { useSocialIdentity } from 'lib/hooks/useTwitterProfile'
import { useTokenHolder } from 'lib/hooks/useTokenHolder'
import { numberWithCommas, getPrecision } from 'lib/utils/numberWithCommas'
import { shorten } from 'lib/utils/shorten'
import { useTransaction } from 'lib/hooks/useTransaction'

export const UsersPoolVotesCard = (props) => {
  const { blockNumber, className } = props
  const { t } = useTranslation()
  const { usersAddress, connectWallet } = useContext(AuthControllerContext)

  const {
    data: tokenHolder,
    isFetched: tokenHolderIsFetched,
    isDataFromBeforeCurrentBlock,
    refetch: refetchTokenHolderData
  } = useTokenHolder(usersAddress, blockNumber)

  if (!usersAddress) {
    return <UsersPoolVotesCardConnectWallet {...props} connectWallet={connectWallet} />
  }

  if (!tokenHolder || !tokenHolderIsFetched) return null

  if (!tokenHolder.hasDelegated && !tokenHolder.canVote && tokenHolder.tokenBalance === '0') {
    return (
      <UsersPoolVotesCardNoPool
        {...props}
        isDataFromBeforeCurrentBlock={isDataFromBeforeCurrentBlock}
      />
    )
  }

  const votingPower = numberWithCommas(tokenHolder.votes, {
    precision: getPrecision(tokenHolder.votes)
  })
  const usersPoolBalance = numberWithCommas(tokenHolder.tokenBalance, {
    precision: getPrecision(tokenHolder.tokenBalance)
  })

  return (
    <Banner
      className={classnames('flex flex-col mb-8 sm:mb-10', className)}
      style={{ color: 'white' }}
    >
      <div className='flex flex-col-reverse xs:flex-row'>
        <div className='flex w-full xs:w-1/4 '>
          <div className='flex-col w-full xs:w-1/2 mb-4 sm:mb-0 '>
            <h5 className='font-normal mb-0 sm:mb-3'>{t('myVotes')}</h5>
            <h2
              className={classnames('leading-none mr-0 sm:mr-4', {
                'opacity-30': !tokenHolder.hasDelegated
              })}
            >
              {usersPoolBalance}
            </h2>
          </div>
        </div>

        {((tokenHolder.hasDelegated && !tokenHolder.selfDelegated) ||
          (tokenHolder.canVote && votingPower !== usersPoolBalance)) && (
          <div className='flex-col w-full xs:w-1/4 mb-4 sm:mb-0 '>
            <h5 className='font-normal mb-0 sm:mb-3'>
              {tokenHolder.hasDelegated && !tokenHolder.selfDelegated
                ? t('myDelegatesVotes')
                : t('myTotalVotes')}
              <div className='inline-block mt-auto ml-2'>
                <PTHint
                  tip={
                    <div className='my-2 text-xs sm:text-sm break-words max-w-full'>
                      <Trans
                        i18nKey='allVotesThatHaveBeenDelegatedToUser'
                        defaults='All votes that have been delegated to <delegate></delegate>'
                        components={{
                          delegate: (
                            <DelegateAddress
                              className='font-bold'
                              address={
                                tokenHolder.canVote ? usersAddress : tokenHolder.delegateAddress
                              }
                            />
                          )
                        }}
                      />
                    </div>
                  }
                >
                  <FeatherIcon icon='info' className='text-inverse w-4 h-4' />
                </PTHint>
              </div>
            </h5>
            <h2 className={classnames('leading-none mr-0 sm:mr-4')}>{votingPower}</h2>
          </div>
        )}

        <div className='flex xs:ml-auto'>
          {isDataFromBeforeCurrentBlock && (
            <div className='ml-auto mb-4 sm:mb-0 flex rounded px-4 py-1 w-fit-content h-fit-content bg-tertiary font-bold'>
              <FeatherIcon icon='alert-circle' className='mr-2 my-auto w-4 h-4' />
              {t('votingPowerIsLockedFromBlock', { blockNumber })}
            </div>
          )}
        </div>
      </div>
      <DelegatedVotes
        tokenHolder={tokenHolder}
        refetchTokenHolderData={refetchTokenHolderData}
        usersPoolBalance={usersPoolBalance}
        isDataFromBeforeCurrentBlock={isDataFromBeforeCurrentBlock}
        blockNumber={blockNumber}
      />
    </Banner>
  )
}

const DelegatedVotes = (props) => {
  const {
    tokenHolder,
    refetchTokenHolderData,
    usersPoolBalance,
    isDataFromBeforeCurrentBlock,
    blockNumber
  } = props

  const { t } = useTranslation()
  const { usersAddress, chainId } = useContext(AuthControllerContext)
  const {
    data: tokenHolderCurrentData,
    isFetched: tokenHolderCurrentDataIsFetched
  } = useTokenHolder(usersAddress, blockNumber)
  const [txId, setTxId] = useState(0)
  const sendTx = useSendTransaction()
  const tx = useTransaction(txId)

  const handleDelegate = async (e) => {
    e.preventDefault()

    const params = [usersAddress]

    const id = await sendTx({
      name: t('selfDelegate'),
      contractAbi: DelegateableERC20ABI,
      contractAddress: CONTRACT_ADDRESSES[chainId].GovernanceToken,
      method: 'delegate',
      params,
      callbacks: {
        refetch: refetchTokenHolderData
      }
    })
    setTxId(id)
  }

  // Transaction states
  if (tx?.completed && !tx?.error && !tx?.cancelled) {
    return (
      <p className='mt-2 xs:mt-4 px-4 py-2 rounded-lg bg-light-purple-35 text-green my-auto font-bold w-fit-content'>
        🎉 {t('successfullyActivatedYourVotes')} 🎉
      </p>
    )
  } else if (tx?.inWallet && !tx?.cancelled) {
    return <TxText className='mt-2 xs:mt-4'>{t('pleaseConfirmInYourWallet')}</TxText>
  } else if (tx?.sent) {
    return <TxText className='mt-2 xs:mt-4'>{t('waitingForConfirmations')}...</TxText>
  }

  // User has self delegated
  if (tokenHolder.selfDelegated) {
    if (tokenHolder.tokenHoldersRepresentedAmount > 1) {
      return (
        <p className='text-accent-1 mt-2 xs:mt-4'>
          <Trans
            i18nKey='youAreVotingOnBehalfOfXUsers'
            defaults='You are voting on behalf of <b>{{amount}}</b> PoolTogether users'
            components={{
              b: <b />
            }}
            values={{
              amount: tokenHolder.tokenHoldersRepresentedAmount
            }}
          />
        </p>
      )
    } else {
      return null
    }
  }

  // User has delegated to someone else
  if (tokenHolder.hasDelegated) {
    return (
      <p className='text-accent-1 mt-2 xs:mt-4'>
        <Trans
          i18nKey='youAreDelegatingXVotesToY'
          defaults='You are delegating <b>{{amount}}</b> votes to <address></address>'
          components={{
            b: <b />,
            address: <DelegateAddress className='font-bold' address={tokenHolder.delegateAddress} />
          }}
          values={{
            amount: usersPoolBalance
          }}
        />
      </p>
    )
  }

  // Looking in the past
  // User didn't delegate at that time, but did after that time
  if (
    (isDataFromBeforeCurrentBlock && tokenHolderCurrentData?.hasDelegated) ||
    !tokenHolderCurrentDataIsFetched
  ) {
    return null
  }

  // User has not delegated their votes
  return (
    <div className='mt-4'>
      <NotDelegatedWarning isDataFromBeforeCurrentBlock={isDataFromBeforeCurrentBlock} />
      <button
        type='button'
        className='hover:opacity-70 text-highlight-9 hover:text-highlight-9 underline trans mr-1 font-bold'
        onClick={handleDelegate}
      >
        {isDataFromBeforeCurrentBlock
          ? t('activateMyVotesForFutureProposals')
          : t('activateMyVotes')}
      </button>
      <Trans
        i18nKey='orDelegateOnSybil'
        components={{
          a: (
            <a
              href='https://sybil.org/#/delegates/pool'
              target='_blank'
              rel='noopener noreferrer'
              title='Sybil'
              className='hover:opacity-70 text-highlight-9 hover:text-highlight-9 underline trans font-bold ml-1'
            />
          )
        }}
      />
    </div>
  )
}

const NotDelegatedWarning = (props) => {
  const { isDataFromBeforeCurrentBlock } = props

  const { t } = useTranslation()

  if (!isDataFromBeforeCurrentBlock) {
    return null
  }

  return (
    <div className='inline-block mb-1 mt-auto mr-2'>
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

export const DelegateAddress = (props) => {
  const { address, className } = props
  const delegateIdentity = useSocialIdentity(address)
  const twitterHandle = delegateIdentity?.twitter?.handle

  if (twitterHandle) {
    return (
      <>
        <a
          className={classnames('text-inverse hover:text-accent-1 mr-2 trans', className)}
          href={`https://twitter.com/${twitterHandle}`}
          target='_blank'
          rel='noopener'
        >
          {twitterHandle}
          <FeatherIcon icon='external-link' className='inline w-4 h-4 mb-1 ml-1' />
        </a>
        (
        <EtherscanAddressLink
          className={classnames('text-inverse hover:text-accent-1 trans', className)}
          address={address}
        >
          {shorten(address)}
        </EtherscanAddressLink>
        )
      </>
    )
  }

  return (
    <EtherscanAddressLink
      className={classnames('text-inverse hover:text-accent-1 mr-2 trans', className)}
      address={address}
    >
      <span className='hidden sm:inline'>{address}</span>
      <span className='inline sm:hidden'>{shorten(address)}</span>
    </EtherscanAddressLink>
  )
}

const UsersPoolVotesCardNoPool = (props) => {
  const { isDataFromBeforeCurrentBlock, className } = props
  const { t } = useTranslation()

  return (
    <Banner className={classnames('mb-8 sm:mb-10', className)} style={{ color: 'white' }}>
      <p className='text-accent-1'>
        {isDataFromBeforeCurrentBlock
          ? t('youPreviouslyHadNoPoolToUseForVotingDescription')
          : t('youCurrentlyHaveNoPoolToUseForVotingDescription')}{' '}
        <Link href='https://app.pooltogether.com' as='https://app.pooltogether.com'>
          <a className='hover:opacity-70 text-highlight-9 hover:text-highlight-9 underline trans font-bold'>
            {t('getPoolFromDepositingInPools')}
          </a>
        </Link>
      </p>
    </Banner>
  )
}

const UsersPoolVotesCardConnectWallet = (props) => {
  const { connectWallet, className } = props

  return (
    <Banner className={classnames('mb-8 sm:mb-10', className)} style={{ color: 'white' }}>
      <Trans
        i18nKey='connectAWalletToVoteAndParticipate'
        defaults='<button>Connect a wallet</button> to vote and participate in governance'
        components={{
          button: (
            <button
              type='button'
              className='hover:opacity-70 text-highlight-9 hover:text-highlight-9 underline trans mt-auto font-bold'
              onClick={() => connectWallet()}
            />
          )
        }}
      />
    </Banner>
  )
}
