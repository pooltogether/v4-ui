import React, { useContext, useEffect, useState } from 'react'
import classnames from 'classnames'
import FeatherIcon from 'feather-icons-react'
import Link from 'next/link'

import DelegateableERC20ABI from 'abis/DelegateableERC20ABI'
import { Trans, useTranslation } from 'lib/../i18n'
import { CONTRACT_ADDRESSES, POOLPOOL_SNAPSHOT_URL, POOLPOOL_URL } from 'lib/constants'
import { AuthControllerContext } from 'lib/components/contextProviders/AuthControllerContextProvider'
import { WalletContext } from 'lib/components/contextProviders/WalletContextProvider'
import { Banner } from 'lib/components/Banner'
import { Button } from 'lib/components/Button'
import { EtherscanAddressLink } from 'lib/components/EtherscanAddressLink'
import { PTHint } from 'lib/components/PTHint'
import { TxText } from 'lib/components/TxText'
import { useSendTransaction } from 'lib/hooks/useSendTransaction'
import { useSocialIdentity } from 'lib/hooks/useTwitterProfile'
import { useTokenHolder } from 'lib/hooks/useTokenHolder'
import { numberWithCommas, getPrecision } from 'lib/utils/numberWithCommas'
import { shorten } from 'lib/utils/shorten'
import { useTransaction } from 'lib/hooks/useTransaction'
import { usePoolPoolBalance } from 'lib/hooks/usePoolPoolBalance'

export const UsersPoolVotesCard = (props) => {
  const { blockNumber, snapshotBlockNumber, className } = props
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

  if (!tokenHolder.isDelegating && !tokenHolder.canVote && tokenHolder.tokenBalance === '0') {
    return (
      <UsersPoolVotesCardNoPool
        {...props}
        isDataFromBeforeCurrentBlock={isDataFromBeforeCurrentBlock}
      />
    )
  }

  const usersPoolBalance = numberWithCommas(tokenHolder.tokenBalance, {
    precision: getPrecision(tokenHolder.tokenBalance)
  })

  return (
    <Banner
      className={classnames('flex flex-col mb-8 sm:mb-10', className)}
      style={{ color: 'white' }}
    >
      {isDataFromBeforeCurrentBlock && (
        <div className='ml-auto mb-4 flex rounded px-4 py-1 w-fit-content h-fit-content bg-tertiary font-bold'>
          <FeatherIcon icon='alert-circle' className='mr-2 my-auto w-4 h-4' />
          {t('votingPowerIsLockedFromBlock', { blockNumber })}
        </div>
      )}
      <div className='flex flex-col sm:flex-row'>
        <UsersVotes tokenHolder={tokenHolder} usersAddress={usersAddress} />
        <UsersPOOLPoolVotes
          tokenHolder={tokenHolder}
          usersAddress={usersAddress}
          snapshotBlockNumber={snapshotBlockNumber}
        />
        <UsersTotalVotes tokenHolder={tokenHolder} usersAddress={usersAddress} />
        <UsersDelegatesVotes tokenHolder={tokenHolder} />
      </div>
      <DelegatedVotesBottom
        tokenHolder={tokenHolder}
        refetchTokenHolderData={refetchTokenHolderData}
        usersPoolBalance={usersPoolBalance}
        isDataFromBeforeCurrentBlock={isDataFromBeforeCurrentBlock}
        blockNumber={blockNumber}
      />
      <PoolPoolLink
        usersAddress={usersAddress}
        tokenHolder={tokenHolder}
        snapshotBlockNumber={snapshotBlockNumber}
      />
    </Banner>
  )
}

// Vote Count Items

const VotingPowerItem = (props) => (
  <div className='flex-col mr-8 last:mr-0 mb-4 sm:mb-0 last:mb-0'>
    <h5 className='font-normal mb-0 sm:mb-3 capitalize'>
      {props.title}
      {props.tooltip && (
        <div className='inline-block mt-auto ml-2'>
          <PTHint tip={props.tooltip}>
            <FeatherIcon
              icon={props.icon ? props.icon : 'info'}
              className={classnames('w-4 h-4', props.iconClassName)}
            />
          </PTHint>
        </div>
      )}
    </h5>
    <h2 className={classnames('leading-none', { 'opacity-30': props.inactive })}>
      {props.votingPower}
    </h2>
  </div>
)

const UsersVotes = (props) => {
  const { tokenHolder, usersAddress } = props
  const { t } = useTranslation()

  const usersPoolBalance = numberWithCommas(tokenHolder.tokenBalance, {
    precision: getPrecision(tokenHolder.tokenBalance)
  })

  return (
    <VotingPowerItem
      inactive={!tokenHolder.isDelegating}
      votingPower={usersPoolBalance}
      title={t('myPool')}
      tooltip={t('poolBalanceOfUser', { address: usersAddress })}
    />
  )
}

const UsersTotalVotes = (props) => {
  const { tokenHolder, usersAddress } = props
  const { t } = useTranslation()

  const votingPower = numberWithCommas(tokenHolder.delegatedVotes, {
    precision: getPrecision(tokenHolder.delegatedVotes)
  })
  const holderHasBeenDelegatedTo = tokenHolder.canVote

  if (!holderHasBeenDelegatedTo) {
    return null
  }

  return (
    <VotingPowerItem
      votingPower={votingPower}
      title={t('myVotingPower')}
      tooltip={t('votingPowerInfo', { address: usersAddress })}
    />
  )
}

const UsersDelegatesVotes = (props) => {
  const { tokenHolder } = props
  const { t } = useTranslation()

  const votingPower = numberWithCommas(tokenHolder?.delegate?.delegatedVotes, {
    precision: getPrecision(tokenHolder?.delegate?.delegatedVotes)
  })
  const holderHasDelegatedToAnotherUser = tokenHolder.isDelegating && !tokenHolder.isSelfDelegated

  if (!holderHasDelegatedToAnotherUser) {
    return null
  }

  return (
    <VotingPowerItem
      votingPower={votingPower}
      title={t('myDelegatesVotes')}
      tooltip={t('delegateVotesInfo', { address: tokenHolder.delegate.id })}
    />
  )
}

const UsersPOOLPoolVotes = (props) => {
  const { usersAddress, snapshotBlockNumber } = props
  const { t } = useTranslation()

  const { data: poolPoolData, isFetched } = usePoolPoolBalance(usersAddress, snapshotBlockNumber)

  if (!isFetched || !poolPoolData || !poolPoolData.hasBalance) {
    return null
  }

  const votingPower = numberWithCommas(poolPoolData.amount, {
    precision: getPrecision(poolPoolData.amount)
  })

  return (
    <VotingPowerItem
      votingPower={votingPower}
      title={t('myPoolPoolVotes')}
      tooltip={
        snapshotBlockNumber
          ? t('poolPoolVotesLockedFromBlock', { blockNumber: snapshotBlockNumber })
          : undefined
      }
    />
  )
}

// Extra Info Items

const DelegatedVotesBottom = (props) => {
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
    isFetched: tokenHolderCurrentDataIsFetched,
    refetch: refetchTokenHolderCurrentData
  } = useTokenHolder(usersAddress)
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
        refetch: () => {
          refetchTokenHolderData()
          refetchTokenHolderCurrentData()
        }
      }
    })
    setTxId(id)
  }

  useEffect(() => {
    setTxId(0)
  }, [usersAddress])

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

  return (
    <div className='flex flex-col mt-2 xs:mt-4 text-accent-1'>
      {tokenHolder.isDelegating && !tokenHolder.isSelfDelegated && (
        <p>
          <Trans
            i18nKey='youAreDelegatingXVotesToY'
            defaults='You are delegating <b>{{amount}}</b> votes to <address></address>'
            components={{
              b: <b />,
              bold: <b />,
              address: <DelegateAddress className='font-bold' address={tokenHolder.delegate.id} />
            }}
            values={{
              amount: usersPoolBalance
            }}
          />
        </p>
      )}
      {tokenHolder.tokenHoldersRepresentedAmount > 1 && (
        <p>
          <Trans
            i18nKey='youAreVotingOnBehalfOfXUsers'
            defaults='You are voting on behalf of <b>{{amount}}</b> PoolTogether users'
            components={{
              b: <b />,
              bold: <b />
            }}
            values={{
              amount: tokenHolder.tokenHoldersRepresentedAmount
            }}
          />
        </p>
      )}
      {tokenHolderCurrentDataIsFetched &&
        !tokenHolderCurrentData?.isDelegating &&
        tokenHolderCurrentData?.tokenBalance !== '0' && (
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
                ),
                link: (
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
        )}
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
  const { handleLoadOnboard } = useContext(WalletContext)

  useEffect(() => {
    handleLoadOnboard()
  }, [])

  const { connectWallet, className } = props

  const { t } = useTranslation()

  return (
    <Banner className={classnames('mb-8 sm:mb-10', className)} style={{ color: 'white' }}>
      <div className='flex flex-col sm:flex-row items-center text-center sm:text-left sm:justify-between'>
        <p className='inline-block mb-0 text-accent-1'>
          <Trans
            i18nKey='connectAWalletToVoteAndParticipate'
            defaults='<button>Connect a wallet</button> to vote and participate in governance'
            components={{
              button: <span />
            }}
          />
        </p>
      </div>
    </Banner>
  )
}

const PoolPoolLink = (props) => {
  const { usersAddress, tokenHolder, snapshotBlockNumber } = props
  const { data: poolPoolData, isFetched } = usePoolPoolBalance(usersAddress, snapshotBlockNumber)

  if (!isFetched || !poolPoolData || !poolPoolData.hasBalance || !usersAddress) {
    return null
  } else if (
    isFetched &&
    !poolPoolData.hasBalance &&
    !tokenHolder.isBeingDelegatedTo &&
    tokenHolder.hasBalance
  ) {
    return (
      <span className='text-accent-1'>
        <Trans
          i18nKey='depositIntoPoolPoolToVoteGasFree'
          defaults='Deposit into the <poolPoolLink>POOL Pool</poolPoolLink> to vote without transaction fees on <snapshotLink>Snapshot</snapshotLink>.'
          components={{
            poolPoolLink: (
              <a
                href={POOLPOOL_URL}
                target='_blank'
                rel='noreferrer noopener'
                className='font-bold underline trans-fast'
              />
            ),
            snapshotLink: (
              <a
                href={POOLPOOL_SNAPSHOT_URL}
                target='_blank'
                rel='noreferrer noopener'
                className='font-bold underline trans-fast'
              />
            )
          }}
        />
      </span>
    )
  }

  return null
}
