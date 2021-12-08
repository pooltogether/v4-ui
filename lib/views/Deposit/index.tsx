import React from 'react'

import { BackToV3Banner } from 'lib/components/BackToV3Banner'
import { DepositCard } from 'lib/views/Deposit/DepositCard'
import { PagePadding } from 'lib/components/Layout/PagePadding'
import { UpcomingPrizeCard } from './UpcomingPrizeCard'

export const DepositUI = () => {
  return (
    <PagePadding className='flex flex-col space-y-4'>
      <UpcomingPrizeCard className='mt-4' />
      <DepositCard />
      <BackToV3Banner />
    </PagePadding>
  )
}
