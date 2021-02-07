import React, { useContext, useState } from 'react'
import FeatherIcon from 'feather-icons-react'
import GovernorAlphaABI from 'abis/GovernorAlphaABI'
import ReactMarkdown from 'react-markdown'
import classnames from 'classnames'
import gfm from 'remark-gfm'
import { useRouter } from 'next/router'
import { useAtom } from 'jotai'

import { useTranslation } from 'lib/../i18n'
import { CONTRACT_ADDRESSES, PROPOSAL_STATUS } from 'lib/constants'
import { transactionsAtom } from 'lib/atoms/transactionsAtom'
import { AuthControllerContext } from 'lib/components/contextProviders/AuthControllerContextProvider'
import { Button } from 'lib/components/Button'
import { PageTitleAndBreadcrumbs } from 'lib/components/PageTitleAndBreadcrumbs'
import { Card } from 'lib/components/Card'
import { VotersTable } from 'lib/components/proposals/VotersTable'
import { UsersVotesCard } from 'lib/components/UsersVotesCard'
import { ProposalStatus } from 'lib/components/proposals/ProposalsList'
import { PTHint } from 'lib/components/PTHint'
import { useProposalData } from 'lib/hooks/useProposalData'
import { useProposalVotes } from 'lib/hooks/useProposalVotes'
import { useSendTransaction } from 'lib/hooks/useSendTransaction'
import { useTokenHolder } from 'lib/hooks/useTokenHolder'
import { useVoteData } from 'lib/hooks/useVoteData'
import { calculateVotePercentage, formatVotes } from 'lib/utils/formatVotes'

const SMALL_DESCRIPTION_LENGTH = 500

export const ProposalUI = (props) => {
  const router = useRouter()
  const { id } = router.query

  const { refetch: refetchProposalData, proposal, loading, error } = useProposalData(id)

  if (!proposal || (!proposal && loading)) {
    return null
  }

  return (
    <>
      <PageTitleAndBreadcrumbs
        title={`Proposal`}
        breadcrumbs={[
          {
            href: '/',
            as: '/',
            name: 'Proposals'
          },
          {
            name: `Proposal #${id}`
          }
        ]}
      />
      {/* <Votes refetch={refetch} proposal={proposal} sendTx={sendTx} /> */}
      <UsersVotesCard blockNumber={Number(proposal.startBlock)} className='mb-8' />
      <ProposalVoteCard proposal={proposal} refetchProposalData={refetchProposalData} />
      <ProposalDescriptionCard proposal={proposal} />
      <VotesCard id={id} />
    </>
  )
}

const ProposalDescriptionCard = (props) => {
  const { proposal } = props
  const { description } = proposal
  const smallDescription = description.length < SMALL_DESCRIPTION_LENGTH
  const [showMore, setShowMore] = useState(smallDescription)

  return (
    <>
      <Card title='Details'>
        <div
          className={classnames('overflow-hidden text-accent-1 relative')}
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
              {showMore ? 'Show less' : 'Show more'}
            </button>
          </div>
        )}
      </Card>
    </>
  )
}

const VotesCard = (props) => {
  const { id } = props
  const { proposal, loading } = useProposalData(id)

  if (loading) {
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
              <h5>Accept</h5>
              <h6 className='font-normal text-xxs sm:text-xs'>{`${formatVotes(
                forVotes
              )} (${forPercentage}%)`}</h6>
            </div>
          </div>
          <div className='flex text-red'>
            <div className='flex flex-col'>
              <h5>Reject</h5>
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
  const { id, title, status } = proposal

  const { usersAddress } = useContext(AuthControllerContext)
  const { data: tokenHolderData } = useTokenHolder(usersAddress)
  const { refetch: refetchTableData } = useProposalVotes(id)
  const { data: voteData, loading: loadingVoteData, refetch: refetchVoteData } = useVoteData(
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
      <div className='flex justify-between flex-col-reverse sm:flex-row'>
        <h6 className='leading-none mb-2 mt-2 sm:mt-0'>Proposal #{id}</h6>
        <ProposalStatus proposal={proposal} />
      </div>
      <h6 className='font-normal mb-8'>{title}</h6>
      {!loadingVoteData && voteData?.delegateDidVote && (
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
      <div className='mt-2 flex justify-end'>
        {showButtons && (
          <>
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
          </>
        )}
      </div>
    </Card>
  )
}

const VoteButtons = (props) => {
  const { id, refetchData, selfDelegated, alreadyVoted } = props
  const { t } = useTranslation()
  const { usersAddress, provider, chainId } = useContext(AuthControllerContext)
  const [transactions, setTransactions] = useAtom(transactionsAtom)
  const [sendTx] = useSendTransaction('Cast Vote', transactions, setTransactions)
  const [txId, setTxId] = useState()
  const [votingFor, setVotingFor] = useState()
  const governanceAddress = CONTRACT_ADDRESSES[chainId].GovernorAlpha
  const tx = transactions?.find((tx) => tx.id === txId)

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

    const txId = await sendTx(
      t,
      provider,
      usersAddress,
      GovernorAlphaABI,
      governanceAddress,
      'castVote',
      params,
      refetchData
    )
    setTxId(txId)
  }

  if (!selfDelegated || alreadyVoted) {
    return null
  }

  if (tx?.completed && !tx?.error && !tx?.cancelled) {
    return (
      <TxText className='text-green'>
        🎉 Successfully voted {votingFor ? 'Accept' : 'Reject'} 🎉
      </TxText>
    )
  }

  if (tx?.inWallet && !tx?.cancelled) {
    return <TxText>Please confirm the transaction in your wallet</TxText>
  }

  if (tx?.sent) {
    return <TxText>Waiting for confirmations...</TxText>
  }

  return (
    <>
      {tx?.error && (
        <div className='text-red flex'>
          <FeatherIcon icon='alert-triangle' className='h-4 w-4 stroke-current my-auto mr-2' />
          <p>Error with transaction. Please try again.</p>
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
            Accept
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
            Reject
          </div>
        </Button>
      </div>
    </>
  )
}

const QueueButton = (props) => {
  const { id, refetchData } = props
  const { t } = useTranslation()
  const { usersAddress, provider, chainId } = useContext(AuthControllerContext)
  const [transactions, setTransactions] = useAtom(transactionsAtom)
  const [sendTx] = useSendTransaction('Queue Proposal', transactions, setTransactions)
  const [txId, setTxId] = useState()
  const governanceAddress = CONTRACT_ADDRESSES[chainId].GovernorAlpha
  const tx = transactions?.find((tx) => tx.id === txId)

  const handleQueueProposal = async (e) => {
    e.preventDefault()

    const params = [id]

    const txId = await sendTx(
      t,
      provider,
      usersAddress,
      GovernorAlphaABI,
      governanceAddress,
      'queue',
      params,
      refetchData
    )
    setTxId(txId)
  }

  if (tx?.completed && !tx?.error && !tx?.cancelled) {
    return <TxText className='text-green'>🎉 Successfully Queued Proposal #{id} 🎉</TxText>
  }

  if (tx?.inWallet && !tx?.cancelled) {
    return <TxText>Please confirm the transaction in your wallet</TxText>
  }

  if (tx?.sent) {
    return <TxText>Waiting for confirmations...</TxText>
  }

  return (
    <div className='flex'>
      {tx?.error && (
        <PTHint
          tip={
            <div className='flex'>
              <p>Error with transaction. Please try again.</p>
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
              <p>Queueing a proposal is...</p>
            </div>
          }
        >
          <FeatherIcon icon='help-circle' className='h-4 w-4 stroke-current my-auto mr-2' />
        </PTHint>
        <Button onClick={handleQueueProposal}>Queue Proposal</Button>
      </div>
    </div>
  )
}

const ExecuteButton = (props) => {
  const { id, refetchData } = props
  const { t } = useTranslation()
  const { usersAddress, provider, chainId } = useContext(AuthControllerContext)
  const [transactions, setTransactions] = useAtom(transactionsAtom)
  const [sendTx] = useSendTransaction('Execute Proposal', transactions, setTransactions)
  const [txId, setTxId] = useState()
  const [payableAmount, setPayableAmount] = useState()
  const governanceAddress = CONTRACT_ADDRESSES[chainId].GovernorAlpha
  const tx = transactions?.find((tx) => tx.id === txId)

  // TODO: Payable Amount

  const handleExecuteProposal = async (e) => {
    e.preventDefault()

    const params = [id]

    const txId = await sendTx(
      t,
      provider,
      usersAddress,
      GovernorAlphaABI,
      governanceAddress,
      'execute',
      params,
      refetchData
    )
    setTxId(txId)
  }

  if (tx?.completed && !tx?.error && !tx?.cancelled) {
    return <TxText className='text-green'>🎉 Successfully Executed Proposal #{id} 🎉</TxText>
  }

  if (tx?.inWallet && !tx?.cancelled) {
    return <TxText>Please confirm the transaction in your wallet</TxText>
  }

  if (tx?.sent) {
    return <TxText>Waiting for confirmations...</TxText>
  }

  return (
    <div className='flex'>
      {tx?.error && (
        <PTHint
          tip={
            <div className='flex'>
              <p>Error with transaction. Please try again.</p>
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
              <p>Executing a proposal is...</p>
            </div>
          }
        >
          <FeatherIcon icon='help-circle' className='h-4 w-4 stroke-current my-auto mr-2' />
        </PTHint>
        <Button
          border='green'
          text='primary'
          bg='green'
          hoverBorder='green'
          hoverText='primary'
          hoverBg='green'
          onClick={handleExecuteProposal}
        >
          Execute Proposal
        </Button>
      </div>
    </div>
  )
}

const TxText = (props) => (
  <p className={classnames('px-4 py-2 rounded-lg pool-gradient-1 my-auto w-fit-content font-bold', props.className)}>
    {props.children}
  </p>
)
