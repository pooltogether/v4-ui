import { V3LoadingDots } from 'lib/components/V3LoadingDots'
import classnames from 'classnames'
import { CONTRACT_ADDRESSES, PROPOSAL_STATUS } from 'lib/constants'
import { useProposalData } from 'lib/hooks/useProposalData'
import { useRouter } from 'next/router'
import React, { useContext, useState } from 'react'
import ReactMarkdown from 'react-markdown'
import { Card } from 'lib/components/Card'
import { Button } from 'lib/components/Button'
import { useAtom } from 'jotai'
import { transactionsAtom } from 'lib/atoms/transactionsAtom'
import { useSendTransaction } from 'lib/hooks/useSendTransaction'
import { calculateVotePercentage, formatVotes } from 'lib/utils/formatVotes'
import { useTranslation } from 'lib/../i18n'
import GovernorAlphaABI from 'abis/GovernorAlphaABI'
import { AuthControllerContext } from 'lib/components/contextProviders/AuthControllerContextProvider'
import { VotersTable } from 'lib/components/proposals/VotersTable'
import { ButtonLink } from 'lib/components/ButtonLink'

export const ProposalUI = (props) => {
  const router = useRouter()
  const { id } = router.query

  const [transactions, setTransactions] = useAtom(transactionsAtom)
  const [sendTx] = useSendTransaction('Cast Vote', transactions, setTransactions)

  const { refetch, proposal, isFetching, isFetched, error } = useProposalData(id)

  if (!isFetched || (isFetching && !isFetched)) {
    return <V3LoadingDots />
  }

  console.log(id, proposal)

  // TODO: Why is this page not being unmounted immediately when clicking "Back" to go back to proposals.
  // Instead, it rerenders with the new route.
  if (!proposal) {
    return null
  }

  const { description } = proposal

  return (
    <>
      <ButtonLink href='/proposals'>Back</ButtonLink>
      <div className='flex justify-between'>
        <h1>Proposal #{id}</h1>
        <ProposalStatus proposal={proposal} />
      </div>
      <Votes refetch={refetch} proposal={proposal} sendTx={sendTx} />
      <ProposalDescription description={description} />
      <VotersTable id={id} />
    </>
  )
}

const ProposalStatus = (props) => {
  const { proposal } = props

  if (proposal.status === PROPOSAL_STATUS.active) {
    return <div>1 Day</div>
  }

  return <div>{proposal.status}</div>
}

const ProposalDescription = (props) => {
  const { description } = props
  const [showMore, setShowMore] = useState(false)

  return (
    <Card>
      <h1>Description:</h1>
      <div
        className={classnames('overflow-hidden text-accent-1 relative mb-8')}
        style={{ maxHeight: showMore ? 'unset' : '300px' }}
      >
        <div
          className='w-full h-full absolute'
          style={{
            backgroundImage: showMore
              ? 'unset'
              : 'linear-gradient(0deg, var(--color-bg-default) 5%, transparent 100%)'
          }}
        />
        <ReactMarkdown className='description whitespace-pre-wrap' children={description} />
      </div>
      <Button
        onClick={(e) => {
          e.preventDefault
          setShowMore(!showMore)
        }}
      >
        {showMore ? 'Show Less' : 'Show More'}
      </Button>
    </Card>
  )
}

const Votes = (props) => {
  const { proposal, sendTx, refetch } = props

  const [txId, setTxId] = useState()

  const { t } = useTranslation()
  const { usersAddress, provider, chainId } = useContext(AuthControllerContext)
  const governanceAddress = CONTRACT_ADDRESSES[chainId].GovernorAlpha

  const handleVoteFor = (e) => {
    e.preventDefault
    castVote(true)
  }

  const handleVoteAgainst = (e) => {
    e.preventDefault
    castVote(false)
  }

  const castVote = async (support) => {
    const params = [proposal.id, support]

    const id = await sendTx(
      t,
      provider,
      usersAddress,
      GovernorAlphaABI,
      governanceAddress,
      'castVote',
      params,
      refetch
    )
    setTxId(id)
  }

  const { forVotes, againstVotes, totalVotes, status } = proposal
  const forPercentage = calculateVotePercentage(forVotes, totalVotes)

  return (
    <Card>
      <div className='flex justify-between mb-4'>
        <div>For: {formatVotes(forVotes)}</div>
        <div>Against: {formatVotes(againstVotes)}</div>
      </div>
      <div className='w-full h-4 flex flex-row rounded-full overflow-hidden mb-4'>
        <div className='bg-green' style={{ width: `${forPercentage}%` }} />
        <div className='bg-red' style={{ width: `${100 - forPercentage}%` }} />
      </div>
      {status === PROPOSAL_STATUS.active && (
        <div className='mt-4'>
          <Button onClick={handleVoteFor}>Vote For</Button>
          <Button onClick={handleVoteAgainst}>Vote Against</Button>
        </div>
      )}
    </Card>
  )
}
