import React from 'react'
import { useRouter } from 'next/router'

import { useTranslation } from 'lib/../i18n'
import { V3LoadingDots } from 'lib/components/V3LoadingDots'
import { useDelegateData } from 'lib/hooks/useDelegateData'
import { Card } from 'lib/components/Card'
import { formatVotes } from 'lib/utils/formatVotes'
import { useTokenHolder } from 'lib/hooks/useTokenHolder'
import { ButtonLink } from 'lib/components/ButtonLink'
import { GovernanceNav } from 'lib/components/GovernanceNav'
import { useSocialIdentity } from 'lib/hooks/useTwitterProfile'

// TODO: Smart contract case. Case when address isn't a token holder but is a delegate
export const DelegateUI = (props) => {
  const { t } = useTranslation()
  const router = useRouter()
  const { address } = router.query

  const { data, isFetched, isFetching, error } = useTokenHolder(address)

  if (!address || !isFetched) {
    return <V3LoadingDots />
  }

  const tokenBalance = data?.tokenBalance ?? 0
  const delegate = data?.delegate ?? {}

  return (
    <>
      <GovernanceNav />
      <Card>
        <h5>{address}</h5>
        <div className='flex flex-col'>
          <h6>{t('tokenBalance')}</h6>
          {tokenBalance ?? 0}
        </div>
      </Card>
      <DelegationCard address={address} delegateAddress={delegate?.id} />
    </>
  )
}

const DelegationCard = (props) => {
  const { t } = useTranslation()

  return <Card>
    <h5>{t('delegation')}</h5>
    <DelegationControls {...props} />
  </Card>
}

const DelegationControls = (props) => {
  const { address, delegateAddress } = props

  const { t } = useTranslation()
  const { data, isFetched, error } = useDelegateData(delegateAddress)
  const identity = useSocialIdentity(delegateAddress)

  if (!isFetched) {
    return null
  }

  const { delegatedVotesRaw } = data.delegate

  if (!delegateAddress) {
    return <>{t('currentlyNotDelegating')}</>
  }

  if (delegateAddress === address) {
    return (
      <>
        <div>{t('selfDelegating')}</div>
        <div>{t('votingPower')}: {formatVotes(delegatedVotesRaw)}</div>
      </>
    )
  }

  // <h6>{t('votes')}</h6>
  // {formatVotes(delegatedVotesRaw)}

  return (
    <div className='flex justify-between'>
      <div className='flex flex-col'>
        <div>
          {t('delegatingTo')}{' '}
          {identity.twitter && (
            <a
              href={`https://twitter.com/${identity.twitter.handle}`}
              target='_blank'
              rel='noopener'
            >
              {identity.twitter.handle}
            </a>
          )}{' '}
          ({delegateAddress})
        </div>
        <div>{t('votingPower')}: {formatVotes(delegatedVotesRaw)}</div>
      </div>

      <ButtonLink as={`/delegate/${delegateAddress}`} href='/delegate/[address]'>
        {t('view')}
      </ButtonLink>
    </div>
  )
}

// const TwitterProfile = (props) => {
//   const { address } = props
//   const { isFetched, data } = useTwitterProfile(address)
//   if (!isFetched) {
//     return null
//   }

//   const { name, profile_image_url, username } = data.data

//   return (
//     <div className='flex flex-row mb-4'>
//       <img src={profile_image_url} className='rounded-full w-8 h-8 mr-2' />
//       <FeatherIcon icon='twitter' className='stroke-1 w-8 h-8 mr-2' />
//       {name}
//     </div>
//   )
// }
