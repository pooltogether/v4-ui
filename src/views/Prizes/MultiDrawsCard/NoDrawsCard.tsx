import { Card } from '@pooltogether/react-components'
import React from 'react'
import { useTranslation } from 'react-i18next'

import { StaticPrizeVideoBackground } from './StaticPrizeVideoBackground'

export const NoDrawsCard = (props: { className?: string }) => {
  const { t } = useTranslation()
  return (
    <Card className='draw-card' paddingClassName=''>
      <StaticPrizeVideoBackground className='absolute inset-0' />
      <div className='absolute bottom-4 left-0 right-0 xs:top-8 xs:bottom-auto xs:left-auto xs:right-auto px-4 xs:px-8 flex flex-col text-center xs:text-left'>
        <span className='text-lg text-inverse'>{t('noDrawsToCheckNoDeposits')}</span>
        <span className=''>{t('comeBackSoon')}</span>
      </div>
    </Card>
  )
}
