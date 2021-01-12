import { ButtonLink } from 'lib/components/ButtonLink'
import { Card } from 'lib/components/Card'
import { PROPOSAL_STATUS } from 'lib/constants'
import React, { useState } from 'react'
import ReactMarkdown from 'react-markdown'
import gfm from 'remark-gfm'

export const ProposalsList = (props) => {
  const { proposals } = props

  if (!proposals) {
    return null
  }

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
