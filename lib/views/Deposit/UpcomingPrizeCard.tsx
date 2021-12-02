import React from 'react'
import classNames from 'classnames'
import { useTranslation } from 'react-i18next'
import { Time } from '@pooltogether/react-components'

import { usePrizePoolBySelectedNetwork } from 'lib/hooks/Tsunami/PrizePool/usePrizePoolBySelectedNetwork'
import { usePrizePoolTokens } from 'lib/hooks/Tsunami/PrizePool/usePrizePoolTokens'
import { useDrawBeaconPeriod } from 'lib/hooks/Tsunami/PrizePoolNetwork/useDrawBeaconPeriod'
import { useTimeUntil } from 'lib/hooks/useTimeUntil'
import { roundPrizeAmount } from 'lib/utils/roundPrizeAmount'
import { AnimatedBorderCard } from 'lib/components/AnimatedCard'
import { ViewPrizeTiersTrigger } from 'lib/components/ViewPrizesTrigger'
import { useUpcomingPrizeTier } from 'lib/hooks/useUpcomingPrizeTier'

export const UpcomingPrizeCard = () => {
  const { t } = useTranslation()

  const prizePool = usePrizePoolBySelectedNetwork()
  const { data: prizePoolTokens, isFetched: isPrizePoolTokensFetched } =
    usePrizePoolTokens(prizePool)
  const { data: prizeTier, isFetched: isPrizeTierFetched } = useUpcomingPrizeTier()

  const isFetched = isPrizePoolTokensFetched && isPrizeTierFetched
  let amountPretty = '--'
  if (isFetched) {
    amountPretty = roundPrizeAmount(
      prizeTier.prize.mul(7),
      prizePoolTokens.ticket.decimals
    ).amountPretty
  }

  return (
    <AnimatedBorderCard innerClassName='flex flex-col text-center relative'>
      <LightningLeft className='absolute top-4 xs:top-4 -left-2 xs:-left-4 sm:-left-8 w-16 h-16 xs:w-24 xs:h-24 sm:w-28 sm:h-28' />
      <LightningRight className='absolute top-3 -right-2 xs:-right-4 sm:-right-8 w-16 h-16 xs:w-24 xs:h-24 sm:w-28 sm:h-28' />
      <div className='mx-auto leading-none relative'>
        <h1 className='text-7xl xs:text-10xl xs:-mt-0 font-semibold text-inverse'>
          {`$${amountPretty}`}
        </h1>

        <div className='uppercase font-semibold text-accent-4 text-xs xs:text-lg mt-2 mb-1'>
          {t('inWeeklyPrizes', 'In weekly prizes')}
        </div>
      </div>

      <DrawCountdown />

      <ViewPrizeBreakdownTrigger
        className='w-max mt-1 mx-auto'
        isFetched={isPrizeTierFetched}
        prizeTier={prizeTier}
      />
    </AnimatedBorderCard>
  )
}

const DrawCountdown = (props) => {
  const { t } = useTranslation()
  const { data: drawBeaconPeriod } = useDrawBeaconPeriod()
  const { secondsLeft } = useTimeUntil(drawBeaconPeriod?.endsAtSeconds.toNumber())
  const drawId = drawBeaconPeriod?.drawId

  if (secondsLeft < 60) {
    return (
      <>
        <DrawNumberString>
          <span>{t('drawNumber', 'Draw #{{number}}', { number: drawId })}</span>
        </DrawNumberString>
        <span className='mt-1 h-14 uppercase font-semibold text-accent-1 text-2xl mx-auto'>
          {t('closingSoon', 'Closing soon')}
        </span>
      </>
    )
  }

  return (
    <>
      <DrawNumberString>
        <span>{t('drawNumber', 'Draw #{{number}}', { number: drawId })}</span>
        <span className='ml-1'>{t('closingIn')}</span>
      </DrawNumberString>
      <Time seconds={secondsLeft} className='mt-1 mx-auto h-14' />
    </>
  )
}

const DrawNumberString = (props) => (
  <span
    {...props}
    className='uppercase font-semibold text-highlight-6 text-xs xs:text-lg mx-auto'
  />
)

const ViewPrizeBreakdownTrigger = (props) => {
  const { t } = useTranslation()
  const { className, isFetched, prizeTier } = props
  const prizePool = usePrizePoolBySelectedNetwork()
  const { data: prizePoolTokens } = usePrizePoolTokens(prizePool)

  if (!isFetched) return null

  return (
    <ViewPrizeTiersTrigger
      label={t('viewDailyPrizes', 'View daily prizes')}
      className={classNames(
        className,
        'relative uppercase font-bold text-xs sm:text-sm transition opacity-80 hover:opacity-100 hover:text-highlight-9 leading-none tracking-wide'
      )}
      ticket={prizePoolTokens?.ticket}
      prizeTier={prizeTier}
    />
  )
}

const LightningLeft = (props) => (
  <div
    className={classNames(props.className, 'bg-contain bg-no-repeat')}
    style={{ backgroundImage: 'url(/lightning-left.png)' }}
  />
)

const LightningRight = (props) => (
  <div
    className={classNames(props.className, 'w-6 h-6 bg-contain bg-no-repeat')}
    style={{ backgroundImage: 'url(/lightning-right.png)' }}
  />
)
function useUpcomingPrize(): {} {
  throw new Error('Function not implemented.')
}
