import React, { useLayoutEffect } from 'react'

import { Trans, useTranslation } from 'lib/../i18n'
import { AddGovernanceTokenToMetaMask } from 'lib/components/AddGovernanceTokenToMetaMask'
import { Button } from 'lib/components/Button'
import { ProposalsList } from 'lib/components/proposals/ProposalsList'
import { RetroactivePoolClaimBanner } from 'lib/components/RetroactivePoolClaimBanner'
import { UsersPoolVotesCard } from 'lib/components/UsersPoolVotesCard'
import { V3LoadingDots } from 'lib/components/V3LoadingDots'
import { useAllProposalsSorted } from 'lib/hooks/useAllProposalsSorted'
import { ButtonLink } from 'lib/components/ButtonLink'
import {
  DISCORD_INVITE_URL,
  POOLPOOL_SNAPSHOT_URL,
  POOLPOOL_URL,
  POOLTOGETHER_GOV_FORUM_URL,
  POOLTOGETHER_SNAPSHOT_URL
} from 'lib/constants'
import Link from 'next/link'

export const ProposalsUI = (props) => {
  const { t } = useTranslation()

  useLayoutEffect(() => {
    window.scrollTo(0, 0)
  }, [])

  const { error, isFetched, sortedProposals } = useAllProposalsSorted()

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
          <div className='mx-4 sm:mr-4 sm:w-2/3'>
            <h1 className='text-inverse'>{t('pooltogetherGovernance')}</h1>

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
          <div className='mx-4 sm:ml-4 sm:w-1/3 flex flex-col justify-center'>
            {Boolean(sortedProposals.active.length) && (
              <ButtonLink
                primary
                href='#_viewActiveProposals'
                textSize='xxs'
                type='button'
                className='w-full mb-4'
              >
                {sortedProposals.active.length}{' '}
                {sortedProposals.active.length === 1 ? t('activeProposal') : t('activeProposals')}
              </ButtonLink>
            )}
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
              href={POOLTOGETHER_GOV_FORUM_URL}
              target='_blank'
              rel='noreferrer noopener'
              textSize='xxs'
              type='button'
              className='w-full'
            >
              {t('discussProposals')}
            </ButtonLink>
          </div>
        </div>

        <h3 className='mb-4 text-lg'>{t('lookingToGetInvolved')}</h3>

        <div className='flex flex-col sm:flex-row'>
          <SmallCard>
            <h6 className='mb-2'>{t('joinTheDiscussion')}</h6>
            <Trans
              i18nKey='checkoutTheForumAndDiscord'
              defaults='Check out our <linkToForum>forum</linkToForum> and our <linkToDiscord>Discord</linkToDiscord> to stay up to date.'
              components={{
                linkToForum: (
                  <a
                    href={POOLTOGETHER_GOV_FORUM_URL}
                    target='_blank'
                    rel='noreferrer noopener'
                    className='font-bold'
                  />
                ),
                linkToDiscord: (
                  <a
                    href={DISCORD_INVITE_URL}
                    target='_blank'
                    rel='noreferrer noopener'
                    className='font-bold'
                  />
                )
              }}
            />
          </SmallCard>
          <SmallCard>
            <h6 className='mb-2'>{t('wantToVoteGasFree')}</h6>
            <Trans
              i18nKey='depositIntoPoolPoolToVoteGasFree'
              defaults='Deposit into the <poolPoolLink>POOL Pool</poolPoolLink> to vote gas free on <snapshotLink>Snapshot</snapshotLink>'
              components={{
                poolPoolLink: (
                  <a
                    href={POOLPOOL_URL}
                    target='_blank'
                    rel='noreferrer noopener'
                    className='font-bold'
                  />
                ),
                snapshotLink: (
                  <a
                    href={POOLPOOL_SNAPSHOT_URL}
                    target='_blank'
                    rel='noreferrer noopener'
                    className='font-bold'
                  />
                )
              }}
            />
          </SmallCard>
          <SmallCard>
            <h6 id='_viewActiveProposals' className='mb-2'>
              {t('haveAnIdea')}
            </h6>
            <Trans
              i18nKey='startATempCheckVote'
              defaults='Start a temperature check vote and see how the community feels on <snapshotLink>Snapshot</snapshotLink> or <createProposalLink>create a proposal</createProposalLink>!'
              components={{
                snapshotLink: (
                  <a
                    href={POOLTOGETHER_SNAPSHOT_URL}
                    target='_blank'
                    rel='noreferrer noopener'
                    className='font-bold'
                  />
                ),
                createProposalLink: (
                  <InternalLink
                    href={`/proposals/create`}
                    className='font-bold'
                    // target='_blank'
                    // rel='noreferrer noopener'
                  />
                )
              }}
            />
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
      'p-4 mx-auto sm:w-1/3 my-2 sm:my-0 sm:mx-4 sm:first:ml-0 sm:last:mr-0 last:mb-0 bg-card rounded-xl'
    }
  >
    {props.children}
  </div>
)

const InternalLink = (props) => (
  <Link as={props.as} href={props.href}>
    <a className={props.className}>{props.children}</a>
  </Link>
)
