import React, { useLayoutEffect } from 'react'

import { useTranslation } from 'lib/../i18n'
import { AddGovernanceTokenToMetaMask } from 'lib/components/AddGovernanceTokenToMetaMask'
import { Button } from 'lib/components/Button'
import { ProposalsList } from 'lib/components/proposals/ProposalsList'
import { RetroactivePoolClaimBanner } from 'lib/components/RetroactivePoolClaimBanner'
import { UsersPoolVotesCard } from 'lib/components/UsersPoolVotesCard'
import { V3LoadingDots } from 'lib/components/V3LoadingDots'
import { useAllProposalsSorted } from 'lib/hooks/useAllProposalsSorted'
import { ButtonLink } from 'lib/components/ButtonLink'

export const ProposalsUI = (props) => {
  const { t } = useTranslation()

  useLayoutEffect(() => {
    window.scrollTo(0, 0)
  }, [])

  const { error, isFetched } = useAllProposalsSorted()

  if (!isFetched) {
    return (
      <div className='flex flex-grow'>
        <V3LoadingDots className='m-auto' />
      </div>
    )
  }

  return (
    <>
      <RetroactivePoolClaimBanner />

      <UsersPoolVotesCard />

      <div className='my-12'>
        <div className='flex flex-col sm:flex-row mb-8 sm:mb-12'>
          <div className='mr-4  w-2/3'>
            <h1 className='text-inverse'>PoolTogether Governance</h1>

            <p className='text-inverse mb-4 sm:mb-8'>
              {t('theProtocolIsControlledByDecentralizedGovernance')}{' '}
              <a
                href='https://medium.com/p/23b09f36db48'
                target='_blank'
                rel='noreferrer noopener'
                className='text-inverse hover:text-highlight-2 underline trans trans-fast'
              >
                {t('readMoreAboutPoolTogetherGovernance')}
              </a>
              .
            </p>
          </div>
          <div className='ml-4 w-1/3 flex flex-col justify-center'>
            <ButtonLink
              primary
              href='https://gov.pooltogether.com/'
              textSize='xxs'
              type='button'
              className='w-full mb-4'
            >
              6 Active Proposals
            </ButtonLink>
            <ButtonLink
              as={`/proposals/create`}
              href={`/proposals/create`}
              disabled
              textSize='xxs'
              className='w-full mb-4'
              tertiary
            >
              {t('createAProposal')}
            </ButtonLink>
            <ButtonLink
              secondary
              href='https://gov.pooltogether.com/'
              textSize='xxs'
              type='button'
              className='w-full'
            >
              {t('discussProposals')}
            </ButtonLink>
          </div>
        </div>

        <h3 className='mb-4'>Looking to get involved?</h3>

        <div className='flex flex-col sm:flex-row'>
          <SmallCard>
            <h6 className='mb-2'>Join the discussion!</h6>
            Check out our <a className='font-bold'>forum</a> and our{' '}
            <a className='font-bold'>discord</a> to stay up to date.
          </SmallCard>
          <SmallCard>
            <h6 className='mb-2'>Want to vote gas free?</h6>Deposit into the{' '}
            <a className='font-bold'>POOL Pool</a> to vote gas free on Snapshot.
          </SmallCard>
          <SmallCard>
            <h6 className='mb-2'>Have an idea?</h6>
            See how the community feels about it on our <a className='font-bold'>forum</a> or{' '}
            <a className='font-bold'>create a proposal</a>!
          </SmallCard>
        </div>
      </div>

      <ProposalsList />

      <AddGovernanceTokenToMetaMask />
    </>
  )
}

const SmallCard = (props) => (
  <div
    className={
      'p-4 w-full sm:w-1/3 my-2 sm:my-0 mx-4 first:ml-0 last:mr-0 last:mb-0 bg-card rounded-xl'
    }
  >
    {props.children}
  </div>
)

const SmallCardTitle = (props) => <h5>{props.children}</h5>
