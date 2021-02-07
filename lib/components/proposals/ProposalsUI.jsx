import React, { useContext } from 'react'

import { AuthControllerContext } from 'lib/components/contextProviders/AuthControllerContextProvider'
import { Button } from 'lib/components/Button'
import { PTHint } from 'lib/components/PTHint'
import { ProposalsList } from 'lib/components/proposals/ProposalsList'
import { UsersVotesCard } from 'lib/components/UsersVotesCard'
import { V3LoadingDots } from 'lib/components/V3LoadingDots'
import { useAllProposalsSorted } from 'lib/hooks/useAllProposalsSorted'

export const ProposalsUI = (props) => {
  const { connectWallet } = useContext(AuthControllerContext)

  const { error, loading } = useAllProposalsSorted()

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

      <h3 className='mt-10'>Vote</h3>

      <p className='text-accent-1 lg:max-w-3xl'>
        The protocol is controlled by decentralized governance. Any changes are presented as
        “proposals” and voted on by POOL token holders.{' '}
        <a
          href=''
          target='_blank'
          rel='noreferrer noopener'
          className='text-accent-1 underline'
        >
          Read more about PoolTogether governance.
        </a>
      </p>

      <p className='mb-4 sm:mb-8'></p>

      <div className='flex flex-col sm:flex-row mb-8 sm:mb-12'>
        <a href='https://gov.pooltogether.com/' target='_blank' rel='noreferrer noopener'>
          <Button textSize='xxs' type='button' className='mb-4 sm:mb-0 w-full sm:w-auto'>
            Discuss Proposals
          </Button>
        </a>

        <PTHint
          tip={
            <div className='my-2 text-center text-xs sm:text-sm'>
              <p>Proposal creation is currently in development.</p>
              <p>Check back soon!</p>
            </div>
          }
        >
          <Button
            disabled
            textSize='xxs'
            className='sm:ml-8 w-full sm:w-auto'
            onClick={(e) => {
              e.preventDefault()
              connectWallet()
            }}
            border='green'
            text='primary'
            bg='green'
            hoverBorder='green'
            hoverText='primary'
            hoverBg='green'
          >
            Create a Proposal
          </Button>
        </PTHint>
      </div>

      <ProposalsList />
    </>
  )
}
