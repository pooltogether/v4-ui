import React from 'react'

import { DepositCard } from '@views/Deposit/DepositCard'
import { PagePadding } from '@components/Layout/PagePadding'
import { UpcomingPrizeCard } from './UpcomingPrizeCard'
import { VotingPromptCard } from '@components/VotingPromptCard'

export const DepositUI = () => {
  return (
    <PagePadding className='flex flex-col space-y-6'>
      <UpcomingPrizeCard className='mt-4' />
      <DepositCard />
      <VotingPromptCard />
    </PagePadding>
  )
}
