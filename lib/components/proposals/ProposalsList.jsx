import { Card, InnerCard } from 'lib/components/Card'
import React, { useState } from 'react'

import { ButtonLink } from 'lib/components/ButtonLink'
import ChatBubble from 'assets/images/chat-bubble.svg'
import { PROPOSAL_STATUS } from 'lib/constants'

export const ProposalsList = (props) => {
  const { proposals } = props

  if (!proposals || Object.keys(proposals)?.length === 0) {
    return (
      <>
        <h3 className='text-accent-1 mb-4'>Proposals</h3>
        <EmptyProposalsList />
      </>
    )
  }

  // TODO: Divide them by active nad non-active

  return (
    <ol>
      {Object.values(proposals)
        .reverse()
        .map((p) => (
          <ProposalItem key={p.id} proposal={p} />
        ))}
    </ol>
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
    id,
  } = proposal

  return (
    <li>
      <Card>
        <div className='flex justify-between'>
          <h3>Proposal {id}</h3>
          <ProposalStatus proposal={proposal} />
        </div>
        <p className='mb-4'>{title}</p>
        <ViewProposalButton proposal={proposal} />
      </Card>
    </li>
  )
}

const ProposalStatus = (props) => {
  const { proposal } = props
  const { status } = proposal

  switch (status) {
    case PROPOSAL_STATUS.pending: {
      return <div>{status.toUpperCase()}</div>
    }
    case PROPOSAL_STATUS.active: {
      return <div>{status.toUpperCase()}</div>
    }
    case PROPOSAL_STATUS.cancelled: {
      return <div>{status.toUpperCase()}</div>
    }
    case PROPOSAL_STATUS.defeated: {
      return <div>{status.toUpperCase()}</div>
    }
    case PROPOSAL_STATUS.succeeded: {
      return <div>{status.toUpperCase()}</div>
    }
    case PROPOSAL_STATUS.queued: {
      return <div>{status.toUpperCase()}</div>
    }
    case PROPOSAL_STATUS.expired: {
      return <div>{status.toUpperCase()}</div>
    }
    case PROPOSAL_STATUS.executed: {
      return <div>{status.toUpperCase()}</div>
    }
  }

  return proposal.status
}

const PositiveStatus = (props) => <div>{props.children}</div>
const NegativeStatus = (props) => <div>{props.children}</div>
const PendingStatus = (props) => <div>{props.children}</div>

const ViewProposalButton = (props) => {
  const { proposal } = props
  const { status, id } = proposal

  // TODO: All states

  if (status === PROPOSAL_STATUS.active) {
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
            href='https://snapshot.page/#/pooltogether'
            target='_blank'
            rel='noreferrer noopener'
          >
            Snapshot
          </a>
          .
        </p>
      </InnerCard>
    </Card>
  )
}
