
import { PagePadding } from '@components/Layout/PagePadding'
import { VotingPromptCard } from '@components/VotingPromptCard'
import { OddsDisclaimer } from '@views/Account/OddsDisclaimer'
import { DepositCard } from '@views/Deposit/DepositCard'
import React from 'react'
import { UpcomingPrizeCard } from './UpcomingPrizeCard'

export const DepositUI = () => {
  return (
    <PagePadding className='flex flex-col space-y-6'>
      <UpcomingPrizeCard className='mt-4' />
      <DepositCard />
      <VotingPromptCard />
      <OddsDisclaimer />
    </PagePadding>
  )
}
