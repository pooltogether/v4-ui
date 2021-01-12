import { ButtonLink } from 'lib/components/ButtonLink'
import React from 'react'

export const GovernanceNav = (props) => {
  return (
    <div className='flex flex-row mb-8'>
      <ButtonLink href='/proposals' className='mr-8'>
        Proposals
      </ButtonLink>
      <ButtonLink href='/delegates'>Delegates</ButtonLink>
    </div>
  )
}
