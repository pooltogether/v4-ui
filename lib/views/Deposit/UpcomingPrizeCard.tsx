import React from 'react'
import classNames from 'classnames'
import { WeeklyPrizeAmountCard, Card } from '@pooltogether/react-components'
import { numberWithCommas } from '@pooltogether/utilities'

import { TSUNAMI_USDC_DRAW_SETTINGS } from 'lib/constants/drawSettings'
import { useSelectedNetworkPrizePool } from 'lib/hooks/Tsunami/PrizePool/useSelectedNetworkPrizePool'
import { usePrizePoolTokens } from 'lib/hooks/Tsunami/PrizePool/usePrizePoolTokens'
// import { getPrettyDate } from 'lib/utils/getNextDrawDate'
// import { useNextDrawDate } from 'lib/hooks/Tsunami/useNextDrawDate'

export const UpcomingPrizeCard = (props) => {
  const { className } = props
  const { data: prizePool } = useSelectedNetworkPrizePool()
  const { data: prizePoolTokens, isFetched } = usePrizePoolTokens(prizePool)
  // const nextDrawDate = useNextDrawDate()

  if (!isFetched) {
    return <Card className={classNames(className, 'flex animate-pulse h-48')} />
  }

  const prizeUnformatted = TSUNAMI_USDC_DRAW_SETTINGS.prize
  const prizePretty = numberWithCommas(prizeUnformatted, {
    decimals: prizePoolTokens.token.decimals
  })

  return <WeeklyPrizeAmountCard prizePretty={prizePretty} sm />
}
