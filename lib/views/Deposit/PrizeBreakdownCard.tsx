import { useTranslation } from 'react-i18next'
import React from 'react'
import { Card } from '@pooltogether/react-components'
import { PrizeBreakdown } from 'lib/components/PrizeBreakdown'
import { TSUNAMI_USDC_PRIZE_DISTRIBUTION } from 'lib/constants/prizeDistribution'
import { usePrizePoolTokens } from 'lib/hooks/Tsunami/PrizePool/usePrizePoolTokens'
import { useSelectedNetworkPrizePool } from 'lib/hooks/Tsunami/PrizePool/useSelectedNetworkPrizePool'

export const PrizeBreakdownCard = (props) => {
  const { data: prizePool } = useSelectedNetworkPrizePool()
  const { data: prizePoolTokens, isFetched } = usePrizePoolTokens(prizePool)

  return (
    <Card className='flex flex-col items-center' paddingClassName='px-8 xs:px-20 p-10'>
      <PrizeBreakdown
        className='w-full'
        prizeDistribution={TSUNAMI_USDC_PRIZE_DISTRIBUTION}
        token={prizePoolTokens?.token}
        isFetched={isFetched}
      />
    </Card>
  )
}
