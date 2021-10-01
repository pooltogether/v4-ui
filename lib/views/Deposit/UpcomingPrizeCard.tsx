import React from 'react'
import classNames from 'classnames'
import { useTranslation } from 'react-i18next'
import { WeeklyPrizeAmountCard, Banner, BannerTheme, Card } from '@pooltogether/react-components'
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

  return (
    <>
      <WeeklyPrizeAmountCard sm />
      {/* <Banner
        className={className}
        theme={BannerTheme.rainbowBorder}
        innerClassName='purple-radial-gradient'
      >
        <div
          className='font-bold text-5xl xs:text-9xl text-center leading-none mt-4'
          style={{ textShadow: '2px 2px rgba(120, 80, 160, 0.5)' }}
        >
          ${prizePretty}
        </div>
        <div
          className='font-inter uppercase font-semibold text-inverse text-center text-xxs mb-4'
          style={{ textShadow: '2px 2px rgba(120, 80, 160, 0.5)' }}
        >
          In weekly prizes
        </div>
      </Banner> */}
    </>
  )
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
