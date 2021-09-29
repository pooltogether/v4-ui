import { useTranslation } from 'react-i18next'
import React from 'react'
import { Card } from '.yalc/@pooltogether/react-components/dist'
import { PrizeBreakdown } from 'lib/components/PrizeBreakdown'
import { TSUNAMI_USDC_DRAW_SETTINGS } from 'lib/constants/drawSettings'
import { usePrizePoolTokens } from 'lib/hooks/Tsunami/PrizePool/usePrizePoolTokens'
import { useSelectedNetworkPrizePool } from 'lib/hooks/Tsunami/PrizePool/useSelectedNetworkPrizePool'

export const PrizeBreakdownCard = (props) => {
  const { data: prizePool } = useSelectedNetworkPrizePool()
  const { data: prizePoolTokens, isFetched } = usePrizePoolTokens(prizePool)

  return (
    <Card className='flex flex-col items-center' paddingClassName='px-8 xs:px-20 p-10'>
      <PrizeBreakdown
        className='w-full'
        drawSettings={TSUNAMI_USDC_DRAW_SETTINGS}
        token={prizePoolTokens?.token}
        isFetched={isFetched}
      />
    </Card>
  )
}
