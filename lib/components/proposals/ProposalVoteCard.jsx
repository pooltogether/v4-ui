import React, { useMemo, useState } from 'react'
import FeatherIcon from 'feather-icons-react'
import GovernorAlphaABI from 'abis/GovernorAlphaABI'

import { useTranslation } from 'react-i18next'
import { useOnboard, useUsersAddress } from '@pooltogether/hooks'
import { useTokenHolder } from 'lib/hooks/useTokenHolder'
import { useVoteData } from 'lib/hooks/useVoteData'
import { CONTRACT_ADDRESSES, PROPOSAL_STATUS } from 'lib/constants'
import { Card } from 'lib/components/Card'
import classnames from 'classnames'
import { ProposalStatus } from 'lib/components/proposals/ProposalsList'
import { useRouter } from 'next/router'
import { useProposalVotesTotalPages } from 'lib/hooks/useProposalVotesTotalPages'
import { useProposalVotes } from 'lib/hooks/useProposalVotes'
import { useSendTransaction } from 'lib/hooks/useSendTransaction'
import { useTransaction } from 'lib/hooks/useTransaction'
import { TxText } from 'lib/components/TxText'
import { Button } from '@pooltogether/react-components'
import { PTHint } from 'lib/components/PTHint'
import { getSecondsSinceEpoch } from 'lib/utils/getCurrentSecondsSinceEpoch'
import { useInterval } from 'lib/hooks/useInterval'
import { ethers } from 'ethers'
import { TimeCountDown } from 'lib/components/TimeCountDown'
import { useGovernanceChainId } from 'lib/hooks/useGovernanceChainId'
import { useIsWalletOnProperNetwork } from 'lib/hooks/useIsWalletOnProperNetwork'

export const ProposalVoteCard = (props) => {
  const { proposal, refetchProposalData, blockNumber } = props

  const { t } = useTranslation()
  const { id, title, status } = proposal

  const usersAddress = useUsersAddress()
  const { data: tokenHolderData } = useTokenHolder(usersAddress, blockNumber)
  const {
    data: voteData,
    isFetched: voteDataIsFetched,
    refetch: refetchVoteData
  } = useVoteData(tokenHolderData?.delegate?.id, id)

  const refetchData = () => {
    refetchVoteData()
    refetchProposalData()
  }

  const showButtons =
    usersAddress &&
    (status === PROPOSAL_STATUS.active ||
      status === PROPOSAL_STATUS.succeeded ||
      status === PROPOSAL_STATUS.queued)

  return (
    <Card>
      <div className='flex justify-between flex-col-reverse sm:flex-row'>
        <h4 className={classnames('mr-2', { 'mb-2 sm:mb-8': showButtons })}>{title}</h4>
        <ProposalStatus proposal={proposal} />
      </div>
      {voteDataIsFetched && voteData?.delegateDidVote && (
        <div className='flex my-auto mt-2'>
          <h6 className='font-normal mr-2 sm:mr-4'>{t('myVote')}:</h6>
          <div
            className={classnames('flex my-auto', {
              'text-green': voteData.support,
              'text-red': !voteData.support
            })}
          >
            <FeatherIcon
              icon={voteData.support ? 'check-circle' : 'x-circle'}
              className='w-6 h-6 mr-2'
            />
            <p className='font-bold'>{voteData.support ? t('accept') : t('reject')}</p>
          </div>
        </div>
      )}

      {showButtons && (
        <>
          {status === PROPOSAL_STATUS.active && (
            <VoteButtons
              usersAddress={usersAddress}
              id={id}
              refetchData={refetchData}
              canVote={tokenHolderData?.canVote}
              alreadyVoted={voteData?.delegateDidVote}
            />
          )}
          {status === PROPOSAL_STATUS.succeeded && (
            <QueueButton id={id} refetchData={refetchData} />
          )}
          {status === PROPOSAL_STATUS.queued && (
            <ExecuteButton
              id={id}
              refetchData={refetchData}
              executionETA={Number(proposal?.executionETA)}
              proposal={proposal}
            />
          )}
        </>
      )}
    </Card>
  )
}

const VoteButtons = (props) => {
  const { id, refetchData, canVote, alreadyVoted, usersAddress } = props

  const router = useRouter()
  const page = router?.query?.page ? parseInt(router.query.page, 10) : 1
  const { refetch: refetchTotalVotesPages } = useProposalVotesTotalPages(id)
  const { refetch: refetchVoterTable } = useProposalVotes(id, page)
  const isWalletOnProperNetwork = useIsWalletOnProperNetwork()

  const { t } = useTranslation()

  const chainId = useGovernanceChainId()
  const sendTx = useSendTransaction()
  const [txId, setTxId] = useState(0)
  const [votingFor, setVotingFor] = useState()
  const governanceAddress = CONTRACT_ADDRESSES[chainId]?.GovernorAlpha
  const tx = useTransaction(txId)

  const handleVoteFor = (e) => {
    e.preventDefault()
    setVotingFor(true)
    castVote(true)
  }

  const handleVoteAgainst = (e) => {
    e.preventDefault()
    setVotingFor(false)
    castVote(false)
  }

  const refetch = () => {
    refetchData()
    refetchTotalVotesPages()
    refetchVoterTable()
  }

  const castVote = async (support) => {
    const params = [id, support]

    const name = t('sendVoteForProposalId', { support: support ? t('accept') : t('reject'), id })

    const txId = await sendTx({
      name,
      contractAbi: GovernorAlphaABI,
      contractAddress: governanceAddress,
      method: 'castVote',
      params,
      callbacks: {
        refetch
      }
    })
    setTxId(txId)
  }

  if (!canVote || alreadyVoted) {
    return null
  }

  if (tx?.completed && !tx?.error && !tx?.cancelled) {
    return (
      <TxText className='text-green ml-auto'>
        🎉 {t('successfullyVoted')} - {votingFor ? t('accept') : t('reject')} 🎉
      </TxText>
    )
  }

  if (tx?.inWallet && !tx?.cancelled && !tx?.error) {
    return <TxText className='ml-auto'>{t('pleaseConfirmInYourWallet')}</TxText>
  }

  if (tx?.sent) {
    return <TxText className='ml-auto'>{t('waitingForConfirmations')}...</TxText>
  }

  return (
    <div className='flex mt-2 justify-end'>
      {tx?.error && (
        <div className='text-red flex'>
          <FeatherIcon icon='alert-triangle' className='h-4 w-4 stroke-current my-auto mr-2' />
          <p>{t('errorWithTxPleaseTryAgain')}</p>
        </div>
      )}
      <Button
        border='green'
        text='primary'
        bg='green'
        hoverBorder='green'
        hoverText='primary'
        hoverBg='green'
        onClick={handleVoteFor}
        className='mr-4'
        disabled={!isWalletOnProperNetwork}
      >
        <div className='flex'>
          <FeatherIcon icon='check-circle' className='my-auto mr-2 h-4 w-4 sm:h-6 sm:w-6' />
          {t('accept')}
        </div>
      </Button>
      <Button
        border='red'
        text='red'
        bg='transparent'
        hoverBorder='red'
        hoverText='red'
        hoverBg='transparent'
        onClick={handleVoteAgainst}
        disabled={!isWalletOnProperNetwork}
      >
        <div className='flex'>
          <FeatherIcon icon='x-circle' className='my-auto mr-2 h-4 w-4 sm:h-6 sm:w-6' />
          {t('reject')}
        </div>
      </Button>
    </div>
  )
}

const QueueButton = (props) => {
  const { id, refetchData } = props

  const { t } = useTranslation()
  const { network: chainId } = useOnboard()
  const sendTx = useSendTransaction()
  const isWalletOnProperNetwork = useIsWalletOnProperNetwork()
  const [txId, setTxId] = useState(0)
  const governanceAddress = CONTRACT_ADDRESSES[chainId]?.GovernorAlpha
  const tx = useTransaction(txId)

  const handleQueueProposal = async (e) => {
    e.preventDefault()

    const params = [id]

    const txId = await sendTx({
      name: t('queueProposal', { id }),
      contractAbi: GovernorAlphaABI,
      contractAddress: governanceAddress,
      method: 'queue',
      params,
      callbacks: {
        refetch: refetchData
      }
    })
    setTxId(txId)
  }

  if (tx?.completed && !tx?.error && !tx?.cancelled) {
    // Successfully Queued Proposal #{ id }
    return (
      <TxText className='text-green ml-auto'>
        🎉 {t('successfullyQueuedProposalId', { id })} 🎉
      </TxText>
    )
  }

  if (tx?.inWallet && !tx?.cancelled && !tx?.error) {
    return <TxText className='ml-auto'>{t('pleaseConfirmInYourWallet')}</TxText>
  }

  if (tx?.sent) {
    return <TxText className='ml-auto'>{t('waitingForConfirmations')}...</TxText>
  }

  return (
    <div className='flex mt-2 justify-end'>
      {tx?.error && (
        <PTHint
          tip={
            <div className='flex'>
              <p>{t('errorWithTxPleaseTryAgain')}</p>
            </div>
          }
        >
          <FeatherIcon
            icon='alert-triangle'
            className='h-4 w-4 text-red stroke-current my-auto mr-2'
          />
        </PTHint>
      )}
      <Button onClick={handleQueueProposal} disabled={!isWalletOnProperNetwork}>
        {t('queueProposal')}
      </Button>
    </div>
  )
}

const ExecuteButton = (props) => {
  const { id, refetchData, executionETA, proposal } = props

  const { t } = useTranslation()
  const { network: chainId } = useOnboard()
  const sendTx = useSendTransaction()
  const isWalletOnProperNetwork = useIsWalletOnProperNetwork()
  const [txId, setTxId] = useState(0)
  const governanceAddress = CONTRACT_ADDRESSES[chainId]?.GovernorAlpha
  const tx = useTransaction(txId)

  const [currentTime, setCurrentTime] = useState(getSecondsSinceEpoch())

  useInterval(() => {
    setCurrentTime(getSecondsSinceEpoch())
  }, 1000)

  const payableAmountInWei = useMemo(
    () =>
      proposal.values.reduce(
        (totalPayableAmount, currentPayableAmount) =>
          totalPayableAmount.add(ethers.BigNumber.from(currentPayableAmount)),
        ethers.BigNumber.from(0)
      ),
    [proposal.values]
  )
  const payableAmountInEther = ethers.utils.formatEther(payableAmountInWei)

  const handleExecuteProposal = async (e) => {
    e.preventDefault()

    const params = [id]

    const txId = await sendTx({
      name: t('executeProposalId', { id }),
      contractAbi: GovernorAlphaABI,
      contractAddress: governanceAddress,
      method: 'execute',
      params,
      callbacks: {
        refetch: refetchData
      },
      value: payableAmountInWei.toHexString()
    })
    setTxId(txId)
  }

  if (tx?.completed && !tx?.error && !tx?.cancelled) {
    return (
      <TxText className='text-green ml-auto'>
        🎉 {t('successfullyExecutedProposalId', { id })} 🎉
      </TxText>
    )
  }

  if (tx?.inWallet && !tx?.cancelled && !tx?.error) {
    return <TxText className='ml-auto'>{t('pleaseConfirmInYourWallet')}</TxText>
  }

  if (tx?.sent) {
    return <TxText className='ml-auto'>{t('waitingForConfirmations')}...</TxText>
  }

  return (
    <>
      {currentTime < executionETA && (
        <div className='flex'>
          <span className='xs:ml-auto mt-auto text-accent-1'>{t('executableIn')}</span>
          <TimeCountDown endTime={executionETA} />
        </div>
      )}
      <div className='flex mt-2 justify-end'>
        {tx?.error && (
          <PTHint
            tip={
              <div className='flex'>
                <p>{t('errorWithTxPleaseTryAgain')}</p>
              </div>
            }
          >
            <FeatherIcon
              icon='alert-triangle'
              className='h-4 w-4 text-red stroke-current my-auto mr-2'
            />
          </PTHint>
        )}
        {!payableAmountInWei.isZero() && (
          <PTHint
            tip={
              <div className='flex'>
                <p>{t('executionCostInEth', { amount: payableAmountInEther.toString() })}</p>
              </div>
            }
          >
            <FeatherIcon
              icon='alert-circle'
              className='h-4 w-4 text-inverse stroke-current my-auto mr-2'
            />
          </PTHint>
        )}
        <Button
          border='green'
          text='primary'
          bg='green'
          hoverBorder='green'
          hoverText='primary'
          hoverBg='green'
          onClick={handleExecuteProposal}
          disabled={currentTime < executionETA || !isWalletOnProperNetwork}
        >
          {t('executeProposal')}
        </Button>
      </div>
    </>
  )
}
