import ChatBubble from 'assets/images/chat-bubble.svg'
import FeatherIcon from 'feather-icons-react'
import classnames from 'classnames'
import React, { useState } from 'react'
import { DateTime } from 'luxon'
import { ButtonLink } from 'lib/components/ButtonLink'
import { Card, InnerCard } from 'lib/components/Card'
import { PROPOSAL_STATUS, SECONDS_PER_BLOCK } from 'lib/constants'
import { useAllProposalsSorted } from 'lib/hooks/useAllProposalsSorted'
import { useCurrentBlock } from 'lib/hooks/useCurrentBlock'
import { ethers } from 'ethers'
import { useTimeCountdown } from 'lib/hooks/useTimeCountdown'
import { CountDown } from 'lib/components/CountDown'
import { msToSeconds } from 'lib/utils/msToSeconds'
import { useProposalData } from 'lib/hooks/useProposalData'

export const ProposalsList = (props) => {
  const { loading, data: proposals, sortedProposals } = useAllProposalsSorted()

  if (!proposals || Object.keys(proposals)?.length === 0) {
    return (
      <>
        <h3 className='text-accent-1 mb-4'>Proposals</h3>
        <EmptyProposalsList />
      </>
    )
  }

  const { executable, approved, active, pending, past } = sortedProposals

  // TODO: Divide them by active nad non-active
  console.log('sorted', sortedProposals)

  return (
    <>
      {executable.length > 0 && (
        <>
          <h6 className='text-accent-1 mb-4'>Executable Proposals</h6>
          <ol>
            {executable.map((p) => (
              <ProposalItem key={p.id} proposal={p} />
            ))}
          </ol>
        </>
      )}
      {approved.length > 0 && (
        <>
          <h6 className='text-accent-1 mb-4'>Approved Proposals</h6>
          <ol>
            {approved.map((p) => (
              <ProposalItem key={p.id} proposal={p} />
            ))}
          </ol>
        </>
      )}
      {active.length > 0 && (
        <>
          <h6 className='text-accent-1 mb-4'>Active Proposals</h6>
          <ol>
            {active.map((p) => (
              <ProposalItem key={p.id} proposal={p} />
            ))}
          </ol>
        </>
      )}
      {pending.length > 0 && (
        <>
          <h6 className='text-accent-1 mb-4'>Pending Proposals</h6>
          <ol>
            {pending.map((p) => (
              <ProposalItem key={p.id} proposal={p} />
            ))}
          </ol>
        </>
      )}
      {past.length > 0 && (
        <>
          <h6 className='text-accent-1 mb-4'>Past Proposals</h6>
          <ol>
            {past.map((p) => (
              <ProposalItem key={p.id} proposal={p} />
            ))}
          </ol>
        </>
      )}
    </>
  )
}

const ProposalItem = (props) => {
  const { proposal } = props

  const {
    status,
    description,
    startBlock,
    endBlock,
    proposer,
    forVotes,
    againstVotes,
    title,
    id
  } = proposal

  return (
    <li>
      <Card>
        <div className='flex justify-between flex-col-reverse sm:flex-row'>
          <h3 className='leading-none mb-2 mt-2 sm:mt-0'>Proposal #{id}</h3>
          <ProposalStatus proposal={proposal} />
        </div>
        <p className='mb-4'>{title}</p>
        <ViewProposalButton proposal={proposal} />
      </Card>
    </li>
  )
}

export const ProposalStatus = (props) => {
  const { proposal } = props
  const { status } = proposal

  let statusValue
  switch (status) {
    case PROPOSAL_STATUS.executed:
    case PROPOSAL_STATUS.succeeded:
    case PROPOSAL_STATUS.active:
    case PROPOSAL_STATUS.queued: {
      statusValue = 1
      break
    }
    case PROPOSAL_STATUS.expired:
    case PROPOSAL_STATUS.defeated:
    case PROPOSAL_STATUS.cancelled: {
      statusValue = -1
      break
    }
    default:
    case PROPOSAL_STATUS.pending: {
      statusValue = 0
      break
    }
  }

  let icon
  if (statusValue < 0) {
    icon = 'x-circle'
  } else if (statusValue > 0) {
    icon = 'check-circle'
  }

  const statusDisplay = status.slice(0, 1).toUpperCase() + status.slice(1)
  const showIcon = status !== PROPOSAL_STATUS.active && status !== PROPOSAL_STATUS.pending

  if (status === PROPOSAL_STATUS.active) {
    return <ProposalCountDown proposal={proposal} />
  }

  return (
    <div
      className={classnames(
        'ml-auto sm:ml-0 mb-4 sm:mb-0 flex rounded px-2 py-1 w-fit-content h-fit-content bg-tertiary',
        {
          'text-red': statusValue < 0,
          'text-green': statusValue > 0,
          'text-inverse': statusValue === 0
        }
      )}
    >
      {proposal.endDate && (
        <div className='mr-2'>{proposal.endDate.toLocaleString(DateTime.DATE_MED)}</div>
      )}
      {icon && showIcon && (
        <FeatherIcon icon={icon} className='my-auto mr-2 stroke-current w-4 h-4' />
      )}
      <div className='font-bold'>{statusDisplay}</div>
    </div>
  )
}

const ProposalCountDown = (props) => {
  const { proposal } = props
  const [seconds] = useState(proposal.endDateSeconds - msToSeconds(Date.now()).toNumber())

  const { refetch } = useProposalData(proposal.id)

  return <CountDown className='ml-auto' seconds={seconds} onZero={refetch} />
}

const ViewProposalButton = (props) => {
  const { proposal } = props
  const { status, id } = proposal

  // TODO: All states

  if (status === PROPOSAL_STATUS.queued) {
    return (
      <ButtonLink
        href={'/proposal/[id]/'}
        as={`/proposal/${id}/`}
        border='green'
        text='primary'
        bg='green'
        hoverBorder='green'
        hoverText='primary'
        hoverBg='green'
      >
        Execute Proposal
      </ButtonLink>
    )
  } else if (status === PROPOSAL_STATUS.succeeded) {
    return (
      <ButtonLink
        href={'/proposal/[id]/'}
        as={`/proposal/${id}/`}
        border='green'
        text='primary'
        bg='green'
        hoverBorder='green'
        hoverText='primary'
        hoverBg='green'
      >
        Queue Proposal
      </ButtonLink>
    )
  } else if (status === PROPOSAL_STATUS.active) {
    return (
      <ButtonLink
        href={'/proposal/[id]/'}
        as={`/proposal/${id}/`}
        border='green'
        text='primary'
        bg='green'
        hoverBorder='green'
        hoverText='primary'
        hoverBg='green'
      >
        Vote now
      </ButtonLink>
    )
  }

  return (
    <ButtonLink href={'/proposal/[id]/'} as={`/proposal/${id}/`}>
      View Proposal
    </ButtonLink>
  )
}

const EmptyProposalsList = () => {
  return (
    <Card>
      <InnerCard className='flex flex-col text-center sm:py-8 text-accent-1'>
        <img src={ChatBubble} className='mx-auto w-16 h-16 sm:w-auto sm:h-auto mb-4 sm:mb-6' />
        <h4 className='mb-2'>No active proposals at the moment!</h4>
        <p>
          We encourage you to discuss any ideas you have on{' '}
          <a
            className='text-accent-1 underline'
            href='https://discord.gg/hxPhPDW'
            rel='noreferrer noopener'
            target='_blank'
          >
            Discord
          </a>{' '}
          and{' '}
          <a
            className='text-accent-1 underline'
            href='https://gov.pooltogether.com/'
            target='_blank'
            rel='noreferrer noopener'
          >
            Discourse
          </a>
          .
        </p>
      </InnerCard>
    </Card>
  )
}
