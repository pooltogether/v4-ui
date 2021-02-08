import React, { useContext } from 'react'

import { AuthControllerContext } from 'lib/components/contextProviders/AuthControllerContextProvider'
import { Button } from 'lib/components/Button'
import { PTHint } from 'lib/components/PTHint'
import { ProposalsList } from 'lib/components/proposals/ProposalsList'
import { UsersVotesCard } from 'lib/components/UsersVotesCard'
import { V3LoadingDots } from 'lib/components/V3LoadingDots'
import { useAllProposalsSorted } from 'lib/hooks/useAllProposalsSorted'
import { ButtonLink } from 'lib/components/ButtonLink'

export const ProposalsUI = (props) => {
  const { connectWallet } = useContext(AuthControllerContext)

  const { loading } = useAllProposalsSorted()

  if (loading) {
    return (
      <div className='flex flex-grow'>
        <V3LoadingDots className='m-auto' />
      </div>
    )
  }

  return (
    <>
      <UsersVotesCard />

      <h1 className='text-accent-1'>Vote</h1>
      <p className='text-accent-1 sm:w-10/12'>
        The protocol is controlled by decentralized governance. Any changes are presented as
        “proposals” and voted on by POOL token holders.{' '}
        <a
          href='https://medium.com/p/23b09f36db48/edit'
          target='_blank'
          rel='noreferrer noopener'
          className='text-accent-1 underline'
        >
          Read more about PoolTogether governance
        </a>
      </p>
      <p className='mb-4 sm:mb-8'></p>

      <div className='flex flex-col sm:flex-row mb-4 sm:mb-8'>
        <a href='https://gov.pooltogether.com/' target='_blank' rel='noreferrer noopener'>
          <Button type='button' className='mb-4 sm:mb-0 w-full sm:w-auto'>
            Discuss Proposals
          </Button>
        </a>

        <ButtonLink
          href={'/proposals/create'}
          as={'/proposals/create'}
          className='sm:ml-8 w-full sm:w-auto'
          border='green'
          text='primary'
          bg='green'
          hoverBorder='green'
          hoverText='primary'
          hoverBg='green'
        >
          Create a Proposal
        </ButtonLink>
      </div>

      <ProposalsList />
    </>
  )
}
