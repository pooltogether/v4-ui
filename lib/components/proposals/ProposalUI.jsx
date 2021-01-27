import { CONTRACT_ADDRESSES, PROPOSAL_STATUS } from 'lib/constants'
import React, { useContext, useState } from 'react'
import { calculateVotePercentage, formatVotes } from 'lib/utils/formatVotes'

import { AuthControllerContext } from 'lib/components/contextProviders/AuthControllerContextProvider'
import { Button } from 'lib/components/Button'
import { PageTitleAndBreadcrumbs } from 'lib/components/PageTitleAndBreadcrumbs'
import { Card } from 'lib/components/Card'
import FeatherIcon from 'feather-icons-react'
import GovernorAlphaABI from 'abis/GovernorAlphaABI'
import ReactMarkdown from 'react-markdown'
import { V3LoadingDots } from 'lib/components/V3LoadingDots'
import { VotersTable } from 'lib/components/proposals/VotersTable'
import classnames from 'classnames'
import gfm from 'remark-gfm'
import { transactionsAtom } from 'lib/atoms/transactionsAtom'
import { useAtom } from 'jotai'
import { useDelegateData } from 'lib/hooks/useDelegateData'
import { useProposalData } from 'lib/hooks/useProposalData'
import { useRouter } from 'next/router'
import { useSendTransaction } from 'lib/hooks/useSendTransaction'
import { useTranslation } from 'lib/../i18n'
import { UsersVotesCard } from 'lib/components/UsersVotesCard'
import { ProposalStatus } from 'lib/components/proposals/ProposalsList'
import { useVoteData } from 'lib/hooks/useVoteData'
import { useTokenHolder } from 'lib/hooks/useTokenHolder'

const SMALL_DESCRIPTION_LENGTH = 500

export const ProposalUI = (props) => {
  const router = useRouter()
  const { id } = router.query

  const { refetch: refetchProposalData, proposal, loading, error } = useProposalData(id)

  // TODO: Why is this page not being unmounted immediately when clicking "Back" to go back to proposals.
  // Instead, it rerenders with the new route.
  if (!proposal || loading) {
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

const UserSection = (props) => {
  let { usersAddress } = useContext(AuthControllerContext)
  // TODO: remove
  usersAddress = '0x7e4a8391c728fed9069b2962699ab416628b19fa'
  const { data, isFetched, isFetching } = useDelegateData(usersAddress)

  if (!usersAddress) {
    return <Card>Please connect your wallet to vote.</Card>
  }

  if (isFetching && !isFetched) {
    return (
      <Card>
        <V3LoadingDots />
      </Card>
    )
  }

  const { delegatedVotesRaw, proposals, tokenHoldersRepresentedAmount } = data.delegate

  return (
    <Card>
      <h5>{usersAddress}</h5>
      <div className='flex flex-col'>
        <h6>Votes</h6>
        {formatVotes(delegatedVotesRaw)}
        <div className='flex flex-row'>
          <FeatherIcon icon='user' className='stroke-1 mr-2' />
          {tokenHoldersRepresentedAmount}
        </div>
      </div>
    </Card>
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
  const { data: voteData, loading: loadingVoteData, refetch: refetchVoteData } = useVoteData(
    tokenHolderData?.delegate?.id,
    id
  )

  const refetchData = () => {
    refetchVoteData()
    refetchProposalData()
  }

  const showButtons =
    status === PROPOSAL_STATUS.active ||
    status === PROPOSAL_STATUS.succeeded ||
    status === PROPOSAL_STATUS.queued

  return (
    <Card>
      <div className='flex justify-between flex-col-reverse sm:flex-row'>
        <h3 className='leading-none mb-2'>Proposal #{id}</h3>
        <ProposalStatus proposal={proposal} />
      </div>
      {title}
      {showButtons && (
        <div className='mt-4 sm:mt-8'>
          {status === PROPOSAL_STATUS.active && (
            <VoteButtons
              id={id}
              refetchData={refetchData}
              selfDelegated={tokenHolderData?.selfDelegated}
            />
          )}
          {status === PROPOSAL_STATUS.succeeded && (
            <QueueButton id={id} refetchData={refetchData} />
          )}
          {status === PROPOSAL_STATUS.queued && <ExecuteButton id={id} refetchData={refetchData} />}
        </div>
      )}
      {!loadingVoteData && voteData?.delegateDidVote && (
        <div className='flex mt-4 sm:mt-8'>
          <p className='mr-4'>My vote:</p>
          <div
            className={classnames('flex', {
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
    </Card>
  )
}

const VoteButtons = (props) => {
  const { id, refetchData, selfDelegated } = props
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

  if (!selfDelegated) {
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
      <div className='mt-4'>
        <Button
          border='green'
          text='primary'
          bg='green'
          hoverBorder='green'
          hoverText='primary'
          hoverBg='green'
          onClick={handleVoteFor}
        >
          Vote For
        </Button>
        <Button onClick={handleVoteAgainst}>Vote Against</Button>
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
    <>
      {tx?.error && (
        <div className='text-red flex'>
          <FeatherIcon icon='alert-triangle' className='h-4 w-4 stroke-current my-auto mr-2' />
          <p>Error with transaction. Please try again.</p>
        </div>
      )}
      <div className='mt-4'>
        <Button onClick={handleQueueProposal}>Queue Proposal</Button>
      </div>
    </>
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

  // TODO: Check if it is executable
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
    <>
      {tx?.error && (
        <div className='text-red flex'>
          <FeatherIcon icon='alert-triangle' className='h-4 w-4 stroke-current my-auto mr-2' />
          <p>Error with transaction. Please try again.</p>
        </div>
      )}
      <div className='mt-4'>
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
    </>
  )
}

const TxText = (props) => (
  <p
    className={classnames('p-2 rounded bg-light-purple-35 my-auto w-fit-content', props.className)}
  >
    {props.children}
  </p>
)
