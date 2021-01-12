import { V3LoadingDots } from 'lib/components/V3LoadingDots'
import FeatherIcon from 'feather-icons-react'
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
import { useDelegateData } from 'lib/hooks/useDelegateData'

export const ProposalUI = (props) => {
  const router = useRouter()
  const { id } = router.query

  console.log(id)

  const [transactions, setTransactions] = useAtom(transactionsAtom)
  const [sendTx] = useSendTransaction('Cast Vote', transactions, setTransactions)

  const { refetch, proposal, loading, error } = useProposalData(id)

  if (!id || loading) {
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
      <UserSection />
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
