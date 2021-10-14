import React from 'react'
import classnames from 'classnames'
import { useTranslation } from 'react-i18next'

import { TSUNAMI_USDC_PRIZE_DISTRIBUTION } from 'lib/constants/prizeDistribution'
import { ViewPrizeTiersTrigger } from 'lib/views/Prizes/DrawCard/DrawDetails'
import { useSelectedNetworkPrizePool } from 'lib/hooks/Tsunami/PrizePool/useSelectedNetworkPrizePool'
import { usePrizePoolTokens } from 'lib/hooks/Tsunami/PrizePool/usePrizePoolTokens'
import { useDrawBeaconPeriod } from 'lib/hooks/Tsunami/LinkedPrizePool/useDrawBeaconPeriod'
import { useTimeUntil } from 'lib/hooks/useTimeUntil'
import { CountdownString } from 'lib/components/CountdownString'
import { roundPrizeAmount } from 'lib/utils/roundPrizeAmount'

export const UpcomingPrizeCard = (props) => {
  const { t } = useTranslation()

  const { data: prizePool } = useSelectedNetworkPrizePool()
  const { data: prizePoolTokens, isFetched } = usePrizePoolTokens(prizePool)
  const { data: drawBeaconPeriod, isFetched: isDrawBeaconPeriodFetched } = useDrawBeaconPeriod()

  const countdown = useTimeUntil(drawBeaconPeriod?.endsAtSeconds.toNumber())

  const { amountPretty } = roundPrizeAmount(
    TSUNAMI_USDC_PRIZE_DISTRIBUTION.prize,
    prizePoolTokens?.token.decimals
  )

  const { weeks, days, hours, minutes } = countdown
  const thereIsWeeks = weeks > 0
  const thereIsDays = thereIsWeeks || days > 0
  const thereIsHours = thereIsDays || hours > 0
  const thereIsMinutes = thereIsHours || minutes > 0

  return (
    <>
      <div
        className={classnames(
          'relative overflow-visible flex flex-col justify-between text-center bg-prize-amount--small'
        )}
      >
        <div className='lightning-bolts z-10' />
        <div className='upcoming-banner-animated mx-auto py-4 xs:py-8'>
          <div className='mx-auto leading-none relative'>
            <h1 className='text-7xl xs:text-10xl xs:-mt-0 font-semibold text-white'>
              {isFetched ? `$${amountPretty}` : '--'}
            </h1>
            <div className='uppercase font-semibold text-accent-4 text-xs xs:text-lg mt-2 mb-4'>
              {t('inDailyPrizes', 'In daily prizes')}
            </div>
          </div>

          {isDrawBeaconPeriodFetched && (
            <div className='uppercase font-semibold text-highlight-6 text-xs xs:text-lg mx-auto relative'>
              {t('drawNumber', 'Draw #{{number}}', { number: drawBeaconPeriod.drawId })}{' '}
              {countdown.secondsLeft === 0 ? (
                t('closesSoon', 'Closes soon')
              ) : (
                <>
                  {t('closingIn', 'Closing in')}
                  <CountdownString
                    className='ml-1'
                    {...countdown}
                    hideHours={thereIsWeeks}
                    hideMinutes={thereIsDays}
                    hideSeconds={thereIsMinutes}
                  />
                </>
              )}
            </div>
          )}

          <ViewPrizeBreakdownTrigger />
        </div>
      </div>
    </>
  )
}

const ViewPrizeBreakdownTrigger = (props) => {
  const { data: prizePool } = useSelectedNetworkPrizePool()
  const { data: prizePoolTokens } = usePrizePoolTokens(prizePool)

  return (
    <ViewPrizeTiersTrigger
      className='relative uppercase underline font-bold text-green text-xs sm:text-sm transition opacity-80 hover:opacity-100 hover:text-highlight-9 leading-none tracking-wide'
      token={prizePoolTokens?.token}
      prizeDistribution={TSUNAMI_USDC_PRIZE_DISTRIBUTION}
    />
  )
}
