import React from 'react'
import { Trans } from 'react-i18next'

import { DepositCard } from 'lib/views/Deposit/DepositCard'
import { PagePadding } from 'lib/components/Layout/PagePadding'
import { UpcomingPrizeCard } from './UpcomingPrizeCard'

export const DepositUI = () => {
  return (
    <PagePadding className='flex flex-col space-y-6'>
      <UpcomingPrizeCard className='mt-4' />
      <DepositCard />
    </PagePadding>
  )
}
