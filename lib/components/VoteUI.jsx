import React from 'react'

import { useTranslation } from 'lib/../i18n'
import { ButtonLink } from 'lib/components/ButtonLink'
import { Tagline } from 'lib/components/Tagline'

import ChillWalletIllustration from 'assets/images/pt-illustration-chill@2x.png'

export const VoteUI = (
  props,
) => {
  const { t } = useTranslation()

  return <>
    <div className='sm:w-2/3 lg:w-7/12 text-center mx-auto mb-20'>
      <img
        src={ChillWalletIllustration}
        alt="chillin' wallet illustration"
        className='w-1/2 xs:w-1/3 lg:w-2/3 mx-auto relative mb-4'
        style={{
          right: -30
        }}
      />
      <h4
        className='mb-6'
      >
        {t('directTheFuture')}
      </h4>
      <div
        className='mb-6 text-sm lg:text-lg text-highlight-2'
      >
        {t('communityHeartOfSuccess')}
        <br />
      </div>

      <ButtonLink
        as='https://snapshot.page/#/pooltogether/proposal/QmRFgSb8Zd3g9LWw8QykZvvnbtcNeRsvRTdARwxj2fdE6D'
        href='https://snapshot.page/#/pooltogether/proposal/QmRFgSb8Zd3g9LWw8QykZvvnbtcNeRsvRTdARwxj2fdE6D'
        target='_blank'
        rel='noreferrer noopener'
      >
        {t('voteNow')}
      </ButtonLink>
    </div>
    
    <Tagline />
  </>
}
