import React from 'react'
import { WeeklyPrizeAmountCard, Card } from '@pooltogether/react-components'
import { numberWithCommas } from '@pooltogether/utilities'

import { TSUNAMI_USDC_PRIZE_DISTRIBUTION } from 'lib/constants/prizeDistribution'
import { useSelectedNetworkPrizePool } from 'lib/hooks/Tsunami/PrizePool/useSelectedNetworkPrizePool'
import { usePrizePoolTokens } from 'lib/hooks/Tsunami/PrizePool/usePrizePoolTokens'
// import { getPrettyDate } from 'lib/utils/getNextDrawDate'
// import { useNextDrawDate } from 'lib/hooks/Tsunami/useNextDrawDate'

export const UpcomingPrizeCard = (props) => {
  const { data: prizePool } = useSelectedNetworkPrizePool()
  const { data: prizePoolTokens, isFetched } = usePrizePoolTokens(prizePool)
  // const nextDrawDate = useNextDrawDate()

  const prizeUnformatted = TSUNAMI_USDC_PRIZE_DISTRIBUTION.prize
  const prizePretty = numberWithCommas(prizeUnformatted, {
    decimals: prizePoolTokens?.token.decimals
  })

  return <WeeklyPrizeAmountCard isFetched={isFetched} prizePretty={prizePretty} sm />
}
