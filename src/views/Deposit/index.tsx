import React from 'react'

import { DepositCard } from '@views/Deposit/DepositCard'
import { PagePadding } from '@components/Layout/PagePadding'
import { UpcomingPrizeCard } from './UpcomingPrizeCard'
import { VotingPromptCard } from '@components/VotingPromptCard'
import { OddsDisclaimer } from '@views/Account/OddsDisclaimer'
import { Carousel } from '@pooltogether/react-components'
import { PrizeBreakdown as PrizeBreakdownTable } from '@components/PrizeBreakdown'
import { useSelectedPrizePool } from '@hooks/v4/PrizePool/useSelectedPrizePool'
import { useUpcomingPrizeTier } from '@hooks/v4/PrizePool/useUpcomingPrizeTier'
import { useSelectedPrizeDistributorToken } from '@hooks/v4/PrizeDistributor/useSelectedPrizeDistributorToken'

export const DepositUI = () => {
  return (
    <PagePadding className='flex flex-col justify-center'>
      <Carousel className='pb-2' marginClassName='-mx-2'>
        <UpcomingPrizeCard />
        <PrizeBreakdown />
      </Carousel>
      <DepositCard />
      <VotingPromptCard />
      <OddsDisclaimer />
    </PagePadding>
  )
}

const PrizeBreakdown = () => {
  const prizePool = useSelectedPrizePool()
  const { data: prizeTierData } = useUpcomingPrizeTier(prizePool)
  const { data: prizeTokenData } = useSelectedPrizeDistributorToken()
  return <PrizeBreakdownTable prizeTier={prizeTierData?.prizeTier} ticket={prizeTokenData?.token} />
}
