import React from 'react'

import { ContentPanesProps } from 'lib/views/DefaultPage'
import { BackToV3Banner } from 'lib/components/BackToV3Banner'
import { DepositCard } from 'lib/views/Deposit/DepositCard'
import { PrizeBreakdownCard } from 'lib/views/Deposit/PrizeBreakdownCard'
import { UpcomingPrizeCard } from 'lib/views/Deposit/UpcomingPrizeCard'

export const DepositUI = (props: ContentPanesProps) => {
  return (
    <div className='flex flex-col space-y-4'>
      <UpcomingPrizeCard />
      <DepositCard {...props} />
      <BackToV3Banner />
      <PrizeBreakdownCard />
    </div>
  )
}
