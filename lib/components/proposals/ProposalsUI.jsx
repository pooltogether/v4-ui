import React, { useLayoutEffect } from 'react'

import { useTranslation } from 'lib/../i18n'
import { AddGovernanceTokenToMetaMask } from 'lib/components/AddGovernanceTokenToMetaMask'
import { Button } from 'lib/components/Button'
import { ProposalsList } from 'lib/components/proposals/ProposalsList'
import { RetroactivePoolClaimBanner } from 'lib/components/RetroactivePoolClaimBanner'
import { UsersVotesCard } from 'lib/components/UsersVotesCard'
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

      <UsersVotesCard />

      <h1 className='text-inverse'>{t('vote')}</h1>

      <p className='text-inverse sm:w-10/12 mb-4 sm:mb-8'>
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

      <div className='flex flex-col sm:flex-row mb-8 sm:mb-12'>
        <ButtonLink
          a={`/proposals/create`}
          href={`/proposals/create`}
          disabled
          textSize='xxs'
          className='w-full sm:w-auto mb-4 sm:mb-0 '
          tertiary
        >
          {t('createAProposal')}
        </ButtonLink>

        <a href='https://gov.pooltogether.com/' target='_blank' rel='noreferrer noopener'>
          <Button secondary textSize='xxs' type='button' className='w-full sm:w-auto sm:ml-2'>
            {t('discussProposals')}
          </Button>
        </a>
      </div>

      <ProposalsList />

      <AddGovernanceTokenToMetaMask />
    </>
  )
}
