import React from 'react'
import { Trans } from 'react-i18next'

import { DepositCard } from '@src/views/Deposit/DepositCard'
import { PagePadding } from '@src/components/Layout/PagePadding'
import { UpcomingPrizeCard } from './UpcomingPrizeCard'

export const DepositUI = () => {
  return (
    <PagePadding className='flex flex-col space-y-6'>
      <UpcomingPrizeCard className='mt-4' />
      <DepositCard />
    </PagePadding>
  )
}
