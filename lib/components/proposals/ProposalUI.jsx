import { CONTRACT_ADDRESSES, PROPOSAL_STATUS } from 'lib/constants'
import React, { useContext, useState } from 'react'
import { calculateVotePercentage, formatVotes } from 'lib/utils/formatVotes'

import { AuthControllerContext } from 'lib/components/contextProviders/AuthControllerContextProvider'
import { Button } from 'lib/components/Button'
import { PageTitleAndBreadcrumbs } from 'lib/components/PageTitleAndBreadcrumbs'
import { ButtonLink } from 'lib/components/ButtonLink'
import { Card, CardHeader } from 'lib/components/Card'
import FeatherIcon from 'feather-icons-react'
import { GovernanceNav } from 'lib/components/GovernanceNav'
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

const SMALL_DESCRIPTION_LENGTH = 500

export const ProposalUI = (props) => {
  const router = useRouter()
  const { id } = router.query

  const [transactions, setTransactions] = useAtom(transactionsAtom)
  const [sendTx] = useSendTransaction('Cast Vote', transactions, setTransactions)

  const { refetch, proposal, loading, error } = useProposalData(id)

  if (!id || loading) {
    return <V3LoadingDots />
  }

  // TODO: Why is this page not being unmounted immediately when clicking "Back" to go back to proposals.
  // Instead, it rerenders with the new route.
  if (!proposal) {
    return null
  }

  const { description } = proposal

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
      {/* TODO: TIME TRAVEL */}
      <UsersVotesCard />
      {/* <ProposalVoteCard /> */}
      <ProposalDescriptionCard proposal={proposal} />
      <VotesCard id={id} />
    </>
  )
}

const ProposalVoteCard = (props) => {
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
  {
    status === PROPOSAL_STATUS.active && (
      <div className='mt-4'>
        <Button onClick={handleVoteFor}>Vote For</Button>
        <Button onClick={handleVoteAgainst}>Vote Against</Button>
      </div>
    )
  }
  return <Card></Card>
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
            className='description whitespace-pre-wrap break-all'
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
  const { refetch, proposal, loading, error } = useProposalData(id)
  const { sendTx } = props

  const [txId, setTxId] = useState()

  const { t } = useTranslation()
  const { usersAddress, provider, chainId } = useContext(AuthControllerContext)
  const governanceAddress = CONTRACT_ADDRESSES[chainId].GovernorAlpha

  if (loading) {
    return null
  }

  const { forVotes, againstVotes, totalVotes, status } = proposal
  const forPercentage = calculateVotePercentage(forVotes, totalVotes)
  const againstPercentage = 100 - forPercentage

  return (
    <>
      <Card title='Votes'>
        <div className='w-full h-2 flex flex-row rounded-full overflow-hidden my-4'>
          <div className='bg-green' style={{ width: `${forPercentage}%` }} />
          <div className='bg-red' style={{ width: `${againstPercentage}%` }} />
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
