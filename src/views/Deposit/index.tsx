import React from 'react'

import { DepositCard } from '@views/Deposit/DepositCard'
import { PagePadding } from '@components/Layout/PagePadding'
import { UpcomingPrizeCard } from './UpcomingPrizeCard'
import { VotingPromptCard } from '@components/VotingPromptCard'
import { OddsDisclaimer } from '@views/Account/OddsDisclaimer'

export const DepositUI = () => {
  return (
    <PagePadding className='flex flex-col space-y-6'>
      <UpcomingPrizeCard className='mt-4' />
      {/* TODO: <DepositCard /> */}
      <VotingPromptCard />
      <OddsDisclaimer />
    </PagePadding>
  )
}
