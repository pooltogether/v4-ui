import React, { useLayoutEffect } from 'react'
import FeatherIcon from 'feather-icons-react'
import classnames from 'classnames'

import { Trans, useTranslation } from 'react-i18next'
import { AddGovernanceTokenToMetaMask } from 'lib/components/AddGovernanceTokenToMetaMask'
import { ProposalsList } from 'lib/components/proposals/ProposalsList'
import { RetroactivePoolClaimBanner } from 'lib/components/RetroactivePoolClaimBanner'
import { UsersPoolVotesCard } from 'lib/components/UsersPoolVotesCard'
import { V3LoadingDots } from 'lib/components/V3LoadingDots'
import { useAllProposalsSorted } from 'lib/hooks/useAllProposalsSorted'
import { ButtonLink } from '@pooltogether/react-components'
import {
  DISCORD_INVITE_URL,
  POOLPOOL_SNAPSHOT_URL,
  POOLPOOL_URL,
  POOLTOGETHER_GOV_FORUM_URL,
  POOLTOGETHER_SNAPSHOT_URL
} from 'lib/constants'
import Link from 'next/link'
import useScreenSize, { ScreenSize } from 'lib/hooks/useScreenSize'

export const ProposalsUI = (props) => {
  const { t } = useTranslation()

  const screenSize = useScreenSize()

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
        <div className='flex flex-col sm:flex-row mb-8'>
          <div className='sm:w-2/3'>
            <h1 className='text-inverse'>{t('pooltogetherGovernance')}</h1>

            <p className='text-inverse mb-8 sm:mb-0'>
              {t('theProtocolIsControlledByDecentralizedGovernance')}
              <a
                href='https://medium.com/p/23b09f36db48'
                target='_blank'
                rel='noreferrer noopener'
                className='text-inverse hover:text-highlight-2 underline trans trans-fast ml-1 font-bold'
              >
                {t('readMoreAboutPoolTogetherGovernance')}
                <LinkIcon className='w-4 h-4 ml-1 mb-1' />
              </a>
              .
            </p>
          </div>
          <div className='mx-4 sm:ml-4 sm:w-1/3 flex flex-col justify-center'>
            {Boolean(sortedProposals.active.length) && screenSize <= ScreenSize.sm && (
              <ButtonLink
                primary
                href='#_viewActiveProposals'
                textSize='xxs'
                type='button'
                className='w-full mb-4'
              >
                {t('viewActiveProposals')}
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
          </div>
        </div>

        <h3 className='mb-4 text-lg'>{t('lookingToGetInvolved')}</h3>

        <div className='flex flex-col sm:flex-row mb-8 sm:mb-16'>
          <SmallCard>
            <h6 className='mb-2'>{t('joinTheDiscussion')}</h6>
            <Trans
              i18nKey='checkoutTheForumAndDiscord'
              defaults='Check out our <linkToForum>forum</linkToForum> and our <linkToDiscord>Discord</linkToDiscord> to stay up to date.'
              components={{
                linkToForum: <SmallCardLink href={POOLTOGETHER_GOV_FORUM_URL} />,
                linkToDiscord: <SmallCardLink href={DISCORD_INVITE_URL} />
              }}
            />
          </SmallCard>
          <SmallCard>
            <h6 className='mb-2'>{t('wantToVoteGasFree')}</h6>
            <Trans
              i18nKey='depositIntoPoolPoolToVoteGasFree'
              defaults='Deposit into the <poolPoolLink>POOL Pool</poolPoolLink> to vote without transaction fees on <snapshotLink>Snapshot</snapshotLink>.'
              components={{
                poolPoolLink: <SmallCardLink href={POOLPOOL_URL} />,
                snapshotLink: <SmallCardLink href={POOLPOOL_SNAPSHOT_URL} />
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
      'p-8 mx-auto w-full sm:w-1/2 my-2 sm:my-0 sm:mx-4 sm:first:ml-0 sm:last:mr-0 last:mb-0 bg-card rounded-xl'
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

const LinkIcon = (props) => (
  <FeatherIcon icon='external-link' className={classnames('inline-block', props.className)} />
)

const SmallCardLink = (props) => (
  <a
    href={props.href}
    target='_blank'
    rel='noreferrer noopener'
    className='font-bold underline trans-fast'
  >
    {props.children}
    <LinkIcon className='w-4 h-4 mx-1 mb-1' />
  </a>
)
