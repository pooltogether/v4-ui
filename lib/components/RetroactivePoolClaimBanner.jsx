import React from 'react'
import { useUsersAddress } from '@pooltogether/hooks'

import { useTranslation } from 'react-i18next'
import { Banner } from 'lib/components/Banner'
import { ButtonLink } from '@pooltogether/react-components'
import { useRetroactivePoolClaimData } from 'lib/hooks/useRetroactivePoolClaimData'

import Bell from 'assets/images/bell@2x.png'

export const RetroactivePoolClaimBanner = () => {
  const { t } = useTranslation()

  const usersAddress = useUsersAddress()
  const { data, isFetched } = useRetroactivePoolClaimData()

  if (!isFetched || data?.isMissing || data?.isClaimed) {
    return null
  }

  return (
    <Banner theme={'rainbow'} className='mb-12'>
      <div className='flex sm:flex-row flex-col'>
        <div className='mb-3 sm:mb-2 ml-0 mr-auto sm:mb-auto sm:mr-4 sm:mt-1'>
          <img className='shake' src={Bell} style={{ maxWidth: 30 }} />
        </div>
        <div>
          <h6>{t('youCanClaimPool')}</h6>
          <p className='mt-1 mb-5 text-xs sm:text-sm w-full xs:w-10/12 sm:w-9/12'>
            {t('retroactivePoolBannerDescription')}
          </p>
          <ButtonLink
            as={`https://app.pooltogether.com?claim=1&address=${usersAddress}`}
            href={`https://app.pooltogether.com?claim=1&address=${usersAddress}`}
            type='button'
            className='w-full xs:w-auto'
            border='transparent'
            text='green'
            bg='secondary'
            hoverBorder='transparent'
            hoverText='green'
            hoverBg='primary'
            textSize='sm'
          >
            {t('claimPool')}
          </ButtonLink>
        </div>
      </div>
    </Banner>
  )
}
