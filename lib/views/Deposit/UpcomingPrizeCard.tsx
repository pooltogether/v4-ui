import { useTranslation } from 'react-i18next'
import { Card, LoadingDots } from '.yalc/@pooltogether/react-components/dist'
import React from 'react'
import { useSelectedNetworkPrizePool } from 'lib/hooks/Tsunami/PrizePool/useSelectedNetworkPrizePool'
import { usePrizePoolTokens } from 'lib/hooks/Tsunami/PrizePool/usePrizePoolTokens'
import { TSUNAMI_USDC_DRAW_SETTINGS } from 'lib/constants/drawSettings'
import { numberWithCommas } from '@pooltogether/utilities'

export const UpcomingPrizeCard = (props) => {
  const { t } = useTranslation()
  const { data: prizePool } = useSelectedNetworkPrizePool()
  const { data: prizePoolTokens, isFetched } = usePrizePoolTokens(prizePool)

  if (!isFetched) {
    return (
      <Card className='hover:bg-secondary trans mb-4'>
        <LoadingDots className='mx-auto my-20' />
      </Card>
    )
  }

  const prizeUnformatted = TSUNAMI_USDC_DRAW_SETTINGS.prize
  const prizePretty = numberWithCommas(prizeUnformatted, {
    decimals: prizePoolTokens.token.decimals
  })

  return (
    <Card className='hover:bg-secondary trans mb-4'>
      <div className='font-inter uppercase text-accent-1 text-center'>{t('weeklyPrize')}</div>
      <div className='font-bold text-5xl xs:text-9xl text-center'>${prizePretty}</div>
      {/* <div className='font-inter text-accent-1 my-4'>{t('awardIn')}</div> */}
      {/* <PrizeCountdown
        textSize='text-xl'
        t={t}
        prizePeriodSeconds={data.prizePeriodSeconds}
        prizePeriodStartedAt={data.prizePeriodStartedAt}
        isRngRequested={data.isRngRequested}
        canStartAward={data.canStartAward}
        canCompleteAward={data.canCompleteAward}
      /> */}
    </Card>
  )
}
