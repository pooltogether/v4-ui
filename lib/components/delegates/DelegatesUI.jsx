import { Button } from 'lib/components/Button'
import { ButtonLink } from 'lib/components/ButtonLink'
import { Card } from 'lib/components/Card'
import { GovernanceNav } from 'lib/components/GovernanceNav'
import { V3LoadingDots } from 'lib/components/V3LoadingDots'
import { useAllDelegates } from 'lib/hooks/useAllDelegates'
import { useSocialIdentity } from 'lib/hooks/useTwitterProfile'
import { formatVotes } from 'lib/utils/formatVotes'
import React from 'react'
import { useState } from 'react'

export const DelegatesUI = (props) => {
  return (
    <>
      <GovernanceNav />
      <DelegatesList />
    </>
  )
}

const DelegatesList = () => {
  const [pageNumber, setPageNumber] = useState(0)
  const { loading, data } = useAllDelegates(pageNumber)

  const prevPage = (e) => {
    e.preventDefault()
    const newPage = pageNumber - 1
    setPageNumber(newPage >= 0 ? newPage : 0)
  }

  const nextPage = (e) => {
    e.preventDefault()
    const newPage = pageNumber + 1
    setPageNumber(newPage)
  }

  if (loading) {
    return <V3LoadingDots />
  }

  const { delegates } = data

  return (
    <>
      <ol>
        {delegates.map((d) => (
          <DelegateItem key={d.id} delegate={d} />
        ))}
      </ol>
      <div className='flex flex-row'>
        <Button onClick={prevPage}>Prev</Button>
        <Button onClick={nextPage}>Next</Button>
        Page: {pageNumber}
      </div>
    </>
  )
}

const DelegateItem = (props) => {
  const { delegate } = props
  const { id: address, delegatedVotesRaw } = delegate
  const votes = formatVotes(delegatedVotesRaw)

  const identity = useSocialIdentity(address)

  return (
    <li>
      <Card className='flex flex-row justify-between mb-4 sm:mb-4'>
        <div className='flex flex-col'>
          <h6>{address}</h6>
          {identity.twitter && (
            <a
              href={`https://twitter.com/${identity.twitter.handle}`}
              target='_blank'
              rel='noopener'
            >
              {identity.twitter.handle}
            </a>
          )}
        </div>
        <div>{votes}</div>
        <ButtonLink as={`/delegate/${address}`} href={'/delegate/[address]'}>
          View
        </ButtonLink>
      </Card>
    </li>
  )
}
