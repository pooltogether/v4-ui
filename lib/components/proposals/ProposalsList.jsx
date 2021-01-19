import React, { useState } from 'react'
import ReactMarkdown from 'react-markdown'
import gfm from 'remark-gfm'

import { ButtonLink } from 'lib/components/ButtonLink'
import { Card, InnerCard } from 'lib/components/Card'
import { PROPOSAL_STATUS } from 'lib/constants'
import ChatBubble from 'assets/images/chat-bubble.svg'

export const ProposalsList = (props) => {
  const { proposals } = props

  // if (!proposals) {
  if (true) {
    return <>
      <h3 className='text-accent-1 mb-4'>Proposals</h3>
      <EmptyProposalsList />
    </>
  }

  // TODO: Divide them by active nad non-active

  if (Object.keys(proposals)?.length === 0) {
    return <NoProposals />
  }

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
    id
  } = proposal

  return (
    <li>
      <Card>
        <div className='flex justify-between'>
          <h3>{title}</h3>
          <div>{status}</div>
        </div>
        <details className='mb-4'>
          <summary>Description</summary>
          <ReactMarkdown className='whitespace-pre-wrap' children={description} />
        </details>
        <ButtonLink href={'/proposal/[id]/'} as={`/proposal/${id}/`}>
          {status === PROPOSAL_STATUS.active ? 'Vote' : 'View'}
        </ButtonLink>
      </Card>
    </li>
  )
}

const NoProposals = () => {
  return <Card>No Proposals have been submitted yet</Card>
}

const EditableProposalDescription = (props) => {
  const { className, description } = props

  const [newDescription, setNewDescription] = useState(description)

  return (
    <div className='flex flex-row w-full'>
      <div className='flex-grow'>
        <textarea
          className='resize-none'
          id='_proposalDescription'
          rows={5}
          cols={33}
          value={newDescription}
          onChange={(e) => {
            e.preventDefault()
            setNewDescription(e.target.value)
          }}
        ></textarea>
      </div>
      <div className='flex-grow'>
        <ReactMarkdown plugins={[gfm]} children={newDescription} />
      </div>
    </div>
  )
}

const EmptyProposalsList = () => {
  return <Card>
    <InnerCard className='flex flex-col text-center sm:py-8 text-accent-1'>
      <img src={ChatBubble} className='mx-auto w-16 h-16 sm:w-auto sm:h-auto mb-4 sm:mb-6' />
      <h4 className='mb-2'>No active proposals at the moment!</h4>
      <p>We encourage you to discuss any ideas you have on <a className='text-accent-1 underline' href='https://discord.gg/hxPhPDW' rel='noreferrer noopener' target='_blank'>Discord</a> and <a className='text-accent-1 underline' href='https://snapshot.page/#/pooltogether' target='_blank' rel='noreferrer noopener'>Snapshot</a>.</p>
    </InnerCard>
  </Card>
}