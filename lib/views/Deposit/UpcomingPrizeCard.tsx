import React from 'react'
import classNames from 'classnames'
import { WeeklyPrizeAmountCard, Card } from '@pooltogether/react-components'
import { numberWithCommas } from '@pooltogether/utilities'

import { TSUNAMI_USDC_DRAW_SETTINGS } from 'lib/constants/drawSettings'
import { useSelectedNetworkPrizePool } from 'lib/hooks/Tsunami/PrizePool/useSelectedNetworkPrizePool'
import { usePrizePoolTokens } from 'lib/hooks/Tsunami/PrizePool/usePrizePoolTokens'

export const UpcomingPrizeCard = (props) => {
  const { className } = props
  const { data: prizePool } = useSelectedNetworkPrizePool()
  const { data: prizePoolTokens, isFetched } = usePrizePoolTokens(prizePool)

  if (!isFetched) {
    return <Card className={classNames(className, 'flex animate-pulse h-48')} />
  }

  const prizeUnformatted = TSUNAMI_USDC_DRAW_SETTINGS.prize
  const prizePretty = numberWithCommas(prizeUnformatted, {
    decimals: prizePoolTokens.token.decimals
  })

  return <WeeklyPrizeAmountCard prizePretty={prizePretty} sm />
}

//  /* <div className='font-inter text-accent-1 my-4'>{t('awardIn')}</div> */
/* <PrizeCountdown
        textSize='text-xl'
        t={t}
        prizePeriodSeconds={data.prizePeriodSeconds}
        prizePeriodStartedAt={data.prizePeriodStartedAt}
        isRngRequested={data.isRngRequested}
        canStartAward={data.canStartAward}
        canCompleteAward={data.canCompleteAward}
      /> */
