import React, { useContext, useState } from 'react'
import FeatherIcon from 'feather-icons-react'
import GovernorAlphaABI from 'abis/GovernorAlphaABI'
import ReactMarkdown from 'react-markdown'
import classnames from 'classnames'
import gfm from 'remark-gfm'
import { useRouter } from 'next/router'

import { useTranslation } from 'lib/../i18n'
import { CONTRACT_ADDRESSES, PROPOSAL_STATUS } from 'lib/constants'
import { AuthControllerContext } from 'lib/components/contextProviders/AuthControllerContextProvider'
import { AddGovernanceTokenToMetaMask } from 'lib/components/AddGovernanceTokenToMetaMask'
import { Button } from 'lib/components/Button'
import { PageTitleAndBreadcrumbs } from 'lib/components/PageTitleAndBreadcrumbs'
import { Card } from 'lib/components/Card'
import { ProposalStatus } from 'lib/components/proposals/ProposalsList'
import { PTHint } from 'lib/components/PTHint'
import { TxText } from 'lib/components/TxText'
import { UsersVotesCard } from 'lib/components/UsersVotesCard'
import { VotersTable } from 'lib/components/proposals/VotersTable'
import { useProposalData } from 'lib/hooks/useProposalData'
import { useProposalVotes } from 'lib/hooks/useProposalVotes'
import { useSendTransaction } from 'lib/hooks/useSendTransaction'
import { useTokenHolder } from 'lib/hooks/useTokenHolder'
import { useVoteData } from 'lib/hooks/useVoteData'
import { calculateVotePercentage, formatVotes } from 'lib/utils/formatVotes'
import { useTransaction } from 'lib/hooks/useTransaction'

const SMALL_DESCRIPTION_LENGTH = 500

export const ProposalUI = (props) => {
  const { t } = useTranslation()

  const router = useRouter()
  const { id } = router.query

  const { refetch: refetchProposalData, proposal, isFetched, error } = useProposalData(id)

  if (!proposal || (!proposal && !isFetched)) {
    return null
  }

  return (
    <>
      <PageTitleAndBreadcrumbs
        title={t('proposals')}
        breadcrumbs={[
          {
            href: '/',
            as: '/',
            name: t('vote')
          },
          {
            href: '/',
            as: '/',
            name: t('proposals')
          },
          {
            name: t('proposalId', { id })
          }
        ]}
      />
      {/* <Votes refetch={refetch} proposal={proposal} sendTx={sendTx} /> */}
      <UsersVotesCard blockNumber={Number(proposal.startBlock)} className='mb-8' />
      <ProposalVoteCard proposal={proposal} refetchProposalData={refetchProposalData} />
      <ProposalDescriptionCard proposal={proposal} />
      <VotesCard id={id} />

      <AddGovernanceTokenToMetaMask />
    </>
  )
}

const ProposalDescriptionCard = (props) => {
  const { proposal } = props

  const { t } = useTranslation()
  const { description } = proposal
  const smallDescription = description.length < SMALL_DESCRIPTION_LENGTH
  const [showMore, setShowMore] = useState(smallDescription)

  return (
    <>
      <Card title={t('details')}>
        <div
          className={classnames('proposal-details overflow-hidden text-inverse relative')}
          style={{ maxHeight: showMore ? 'unset' : '300px' }}
        >
          {!showMore && (
            <div
              className='w-full h-full absolute'
              style={{
                backgroundImage: showMore
                  ? 'unset'
                  : 'linear-gradient(0deg, var(--color-bg-default) 5%, transparent 100%)'
              }}
            />
          )}
          <ReactMarkdown
            plugins={[gfm]}
            className='description whitespace-pre-wrap break-word'
            children={description}
          />
        </div>
        {!smallDescription && (
          <div className='flex mt-8'>
            <button
              className='mx-auto text-accent-1'
              type='button'
              onClick={(e) => {
                e.preventDefault
                setShowMore(!showMore)
              }}
            >
              {showMore ? t('showLess') : t('showMore')}
            </button>
          </div>
        )}
      </Card>
    </>
  )
}

const VotesCard = (props) => {
  const { id } = props

  const { t } = useTranslation()
  const { proposal, isFetched } = useProposalData(id)

  if (!isFetched) {
    return null
  }

  const { forVotes, againstVotes, totalVotes, status } = proposal

  const noVotes = totalVotes.isZero()
  const forPercentage = noVotes ? 0 : calculateVotePercentage(forVotes, totalVotes)
  const againstPercentage = noVotes ? 0 : 100 - forPercentage

  return (
    <>
      <Card title='Votes'>
        <div className='w-full h-2 flex flex-row rounded-full overflow-hidden my-4'>
          {!noVotes && (
            <>
              <div className='bg-green' style={{ width: `${forPercentage}%` }} />
              <div className='bg-red' style={{ width: `${againstPercentage}%` }} />
            </>
          )}
          {noVotes && <div className='bg-tertiary w-full' />}
        </div>

        <div className='flex justify-between mb-4 sm:mb-8'>
          <div className='flex text-green'>
            <FeatherIcon
              className='mr-2 my-auto w-8 h-8 sm:w-10 sm:h-10 stroke-current'
              icon='check-circle'
            />
            <div className='flex flex-col'>
              <h5>{t('accept')}</h5>
              <h6 className='font-normal text-xxs sm:text-xs'>{`${formatVotes(
                forVotes
              )} (${forPercentage}%)`}</h6>
            </div>
          </div>
          <div className='flex text-red'>
            <div className='flex flex-col'>
              <h5>{t('reject')}</h5>
              <h6 className='font-normal text-xxs sm:text-xs'>{`${formatVotes(
                againstVotes
              )} (${againstPercentage}%)`}</h6>
            </div>
            <FeatherIcon
              className='ml-2 my-auto w-8 h-8 sm:w-10 sm:h-10 stroke-current'
              icon='x-circle'
            />
          </div>
        </div>

        <VotersTable id={id} />
      </Card>
    </>
  )
}

const ProposalVoteCard = (props) => {
  const { proposal, refetchProposalData } = props

  const { t } = useTranslation()
  const { id, title, status } = proposal

  const { usersAddress } = useContext(AuthControllerContext)
  const { data: tokenHolderData } = useTokenHolder(usersAddress)
  const { refetch: refetchTableData } = useProposalVotes(id)
  const { data: voteData, isFetched: voteDataIsFetched, refetch: refetchVoteData } = useVoteData(
    tokenHolderData?.delegate?.id,
    id
  )

  const refetchData = () => {
    refetchVoteData()
    refetchProposalData()
    refetchTableData()
  }

  const showButtons =
    usersAddress &&
    (status === PROPOSAL_STATUS.active ||
      status === PROPOSAL_STATUS.succeeded ||
      status === PROPOSAL_STATUS.queued)

  return (
    <Card>
      <div className='flex justify-between flex-col sm:flex-row'>
        <h4 className={classnames({ 'mb-2 sm:mb-8': showButtons })}>{title}</h4>
        <ProposalStatus proposal={proposal} />
      </div>
      {voteDataIsFetched && voteData?.delegateDidVote && (
        <div className='flex my-auto mt-4 sm:mt-8'>
          <h6 className='font-normal mr-2 sm:mr-4'>My vote:</h6>
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
            <p className='font-bold'>{voteData.support ? 'Accept' : 'Reject'}</p>
          </div>
        </div>
      )}

      {showButtons && (
        <div className='mt-2 flex justify-end h-12'>
          {status === PROPOSAL_STATUS.active && (
            <VoteButtons
              id={id}
              refetchData={refetchData}
              selfDelegated={tokenHolderData?.selfDelegated}
              alreadyVoted={voteData?.delegateDidVote}
            />
          )}
          {status === PROPOSAL_STATUS.succeeded && (
            <QueueButton id={id} refetchData={refetchData} />
          )}
          {status === PROPOSAL_STATUS.queued && (
            <ExecuteButton id={id} refetchData={refetchData} />
          )}
        </div>
      )}
    </Card>
  )
}

const VoteButtons = (props) => {
  const { id, refetchData, selfDelegated, alreadyVoted } = props

  const { t } = useTranslation()

  const { chainId } = useContext(AuthControllerContext)
  const sendTx = useSendTransaction()
  const [txId, setTxId] = useState(0)
  const [votingFor, setVotingFor] = useState()
  const governanceAddress = CONTRACT_ADDRESSES[chainId].GovernorAlpha
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

  const castVote = async (support) => {
    const params = [id, support]

    const txName = t('sendVoteForProposalId', { support: support ? t('accept') : t('reject'), id })

    const txId = await sendTx(
      txName,
      GovernorAlphaABI,
      governanceAddress,
      'castVote',
      params,
      {
        refetch: refetchData
      }
    )
    setTxId(txId)
  }

  if (!selfDelegated || alreadyVoted) {
    return null
  }

  if (tx?.completed && !tx?.error && !tx?.cancelled) {
    return (
      <TxText className='text-green'>
        🎉 {t('successfullyVoted')} - {votingFor ? t('accept') : t('reject')} 🎉
      </TxText>
    )
  }

  if (tx?.inWallet && !tx?.cancelled) {
    return <TxText>{t('pleaseConfirmInYourWallet')}</TxText>
  }

  if (tx?.sent) {
    return <TxText>{t('waitingForConfirmations')}...</TxText>
  }

  return (
    <>
      {tx?.error && (
        <div className='text-red flex'>
          <FeatherIcon icon='alert-triangle' className='h-4 w-4 stroke-current my-auto mr-2' />
          <p>{t('errorWithTxPleaseTryAgain')}</p>
        </div>
      )}
      <div>
        <Button
          border='green'
          text='primary'
          bg='green'
          hoverBorder='green'
          hoverText='primary'
          hoverBg='green'
          onClick={handleVoteFor}
          className='mr-4'
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
        >
          <div className='flex'>
            <FeatherIcon icon='x-circle' className='my-auto mr-2 h-4 w-4 sm:h-6 sm:w-6' />
            {t('reject')}
          </div>
        </Button>
      </div>
    </>
  )
}

const QueueButton = (props) => {
  const { id, refetchData } = props

  const { t } = useTranslation()
  const { chainId } = useContext(AuthControllerContext)
  const sendTx = useSendTransaction()
  const [txId, setTxId] = useState(0)
  const governanceAddress = CONTRACT_ADDRESSES[chainId].GovernorAlpha
  const tx = useTransaction(txId)

  const handleQueueProposal = async (e) => {
    e.preventDefault()

    const params = [id]

    const txId = await sendTx(
      t('queueProposal', { id }),
      GovernorAlphaABI,
      governanceAddress,
      'queue',
      params,
      {
        refetch: refetchData
      }
    )
    setTxId(txId)
  }

  if (tx?.completed && !tx?.error && !tx?.cancelled) {
    // Successfully Queued Proposal #{ id }
    return <TxText className='text-green'>🎉 {t('successfullyQueuedProposalId', { id })} 🎉</TxText>
  }

  if (tx?.inWallet && !tx?.cancelled) {
    return <TxText>{t('pleaseConfirmInYourWallet')}</TxText>
  }

  if (tx?.sent) {
    return <TxText>{t('waitingForConfirmations')}...</TxText>
  }

  return (
    <div className='flex'>
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
            className='h-4 w-4 text-red stroke-current my-auto mr-2 mt-2'
          />
        </PTHint>
      )}
      <div className='flex'>
        <PTHint
          tip={
            <div className='flex'>
              <p>{t('queueingAProposalDescription')}</p>
            </div>
          }
        >
          <FeatherIcon icon='help-circle' className='h-4 w-4 stroke-current my-auto mr-2' />
        </PTHint>
        <Button onClick={handleQueueProposal}>{t('queueProposal')}</Button>
      </div>
    </div>
  )
}

const ExecuteButton = (props) => {
  const { id, refetchData } = props

  const { t } = useTranslation()
  const { chainId } = useContext(AuthControllerContext)
  const sendTx = useSendTransaction()
  const [txId, setTxId] = useState(0)
  const [payableAmount, setPayableAmount] = useState()
  const governanceAddress = CONTRACT_ADDRESSES[chainId].GovernorAlpha
  const tx = useTransaction(txId)

  // TODO: Payable Amount

  const handleExecuteProposal = async (e) => {
    e.preventDefault()

    const params = [id]

    const txId = await sendTx(
      t('executeProposalId', { id }),
      GovernorAlphaABI,
      governanceAddress,
      'execute',
      params,
      {
        refetch: refetchData
      }
    )
    setTxId(txId)
  }

  if (tx?.completed && !tx?.error && !tx?.cancelled) {
    // Successfully Executed Proposal #{ id }
    return (
      <TxText className='text-green'>🎉 {t('successfullyExecutedProposalId', { id })} 🎉</TxText>
    )
  }

  if (tx?.inWallet && !tx?.cancelled) {
    return <TxText>{t('pleaseConfirmInYourWallet')}</TxText>
  }

  if (tx?.sent) {
    return <TxText>{t('waitingForConfirmations')}...</TxText>
  }

  return (
    <div className='flex'>
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
            className='h-4 w-4 text-red stroke-current my-auto mr-2 mt-2'
          />
        </PTHint>
      )}
      <div className='flex'>
        {/* <PTHint
          tip={
            <div className='flex'>
              <p>TODO: Explain what executing a proposal is...</p>
            </div>
          }
        >
          <FeatherIcon icon='help-circle' className='h-4 w-4 stroke-current my-auto mr-2' />
        </PTHint> */}
        <Button
          border='green'
          text='primary'
          bg='green'
          hoverBorder='green'
          hoverText='primary'
          hoverBg='green'
          onClick={handleExecuteProposal}
        >
          {t('executeProposal')}
        </Button>
      </div>
    </div>
  )
}
