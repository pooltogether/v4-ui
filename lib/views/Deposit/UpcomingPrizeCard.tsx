import React from 'react'
import classNames from 'classnames'
import { Trans, useTranslation } from 'react-i18next'

import { usePrizePoolBySelectedChainId } from 'lib/hooks/Tsunami/PrizePool/usePrizePoolBySelectedChainId'
import { usePrizePoolTokens } from 'lib/hooks/Tsunami/PrizePool/usePrizePoolTokens'
import { useDrawBeaconPeriod } from 'lib/hooks/Tsunami/PrizePoolNetwork/useDrawBeaconPeriod'
import { useTimeUntil } from 'lib/hooks/useTimeUntil'
import { roundPrizeAmount } from 'lib/utils/roundPrizeAmount'
import { ViewPrizesSheetCustomTrigger } from 'lib/components/ViewPrizesSheetButton'
import { useUpcomingPrizeTier } from 'lib/hooks/useUpcomingPrizeTier'
import { Time } from 'lib/components/Time'
import { PrizeTier } from '@pooltogether/v4-js-client'
import { Token } from '@pooltogether/hooks'
import { calculateTotalNumberOfPrizes } from 'lib/utils/calculateTotalNumberOfPrizes'
import { CountUp } from 'lib/components/CountUp'
import { ThemedClipSpinner } from '@pooltogether/react-components'

export const UpcomingPrizeCard = (props: { className?: string }) => {
  const { className } = props
  const prizePool = usePrizePoolBySelectedChainId()
  const { data: prizePoolTokens, isFetched: isPrizePoolTokensFetched } =
    usePrizePoolTokens(prizePool)
  const { data: prizeTier, isFetched: isPrizeTierFetched } = useUpcomingPrizeTier()

  const ticket = prizePoolTokens?.ticket
  const isFetched = isPrizePoolTokensFetched && isPrizeTierFetched

  return (
    <div className={classNames('flex flex-col text-center space-y-2 relative', className)}>
      <LightningBolts />
      <Dots />

      <AmountOfPrizes isFetched={isFetched} prizeTier={prizeTier} ticket={ticket} />
      <PrizeAmount isFetched={isFetched} prizeTier={prizeTier} ticket={ticket} />
      <DrawCountdown />
    </div>
  )
}

const AmountOfPrizes = (props: { isFetched: boolean; ticket: Token; prizeTier: PrizeTier }) => {
  const { isFetched, ticket, prizeTier } = props

  let amountOfPrizes = '--'
  if (isFetched) {
    amountOfPrizes = String(calculateTotalNumberOfPrizes(prizeTier))
  }

  return (
    <div className='uppercase font-semibold text-inverse text-xs xs:text-lg mt-2 mb-1'>
      <Trans
        i18nKey='prizesEverySingleDay'
        components={{
          button: (
            <ViewPrizesSheetCustomTrigger
              ticket={ticket}
              prizeTier={prizeTier}
              Button={(props) => (
                <button
                  {...props}
                  className='underline text-gradient-cyan hover:opacity-50 font-bold transition'
                />
              )}
            />
          )
        }}
        values={{ amount: amountOfPrizes }}
      />
    </div>
  )
}

const PrizeAmount = (props: { isFetched: boolean; ticket: Token; prizeTier: PrizeTier }) => {
  const { isFetched, ticket, prizeTier } = props

  let amount = 0
  if (isFetched) {
    amount = Number(roundPrizeAmount(prizeTier.prize, ticket.decimals).amount)
  }

  return (
    <h1
      className={classNames(
        'text-10xl xs:text-13xl xs:-mt-0 font-semibold text-pt-gradient pointer-events-none mx-auto leading-none relative',
        { 'opacity-50': !amount }
      )}
    >
      $<CountUp countTo={amount} />
      {!amount && <ThemedClipSpinner sizeClassName='w-4 h-4' className='ml-2 absolute bottom-2' />}
    </h1>
  )
}

const DrawCountdown = (props) => {
  const { t } = useTranslation()
  const { data: drawBeaconPeriod } = useDrawBeaconPeriod()
  const { secondsLeft } = useTimeUntil(drawBeaconPeriod?.endsAtSeconds.toNumber())
  const drawId = drawBeaconPeriod?.drawId

  if (secondsLeft < 60) {
    return (
      <div className='flex flex-col mx-auto'>
        <DrawNumberString>
          <span>{t('drawNumber', 'Draw #{{number}}', { number: drawId })}</span>
        </DrawNumberString>
        <span className='mt-1 h-14 uppercase font-semibold text-accent-1 text-2xl mx-auto'>
          {t('closingSoon', 'Closing soon')}
        </span>
      </div>
    )
  }

  return (
    <div className='flex flex-col mx-auto'>
      <DrawNumberString>
        <span>{t('joinDrawNumber', 'Join draw #{{number}}', { number: drawId })}</span>
      </DrawNumberString>
      <Time
        seconds={secondsLeft}
        className='mt-1 mx-auto h-14'
        timeClassName='text-sm xs:text-lg'
      />
    </div>
  )
}

const DrawNumberString = (props) => (
  <span {...props} className='uppercase font-semibold text-accent-4 text-xs xs:text-lg mx-auto' />
)

const LightningBolt = (props: {
  className: string
  color: string
  scale: number
  flip?: boolean
}) => (
  <div
    className={classNames(props.className, 'bg-contain bg-no-repeat absolute')}
    style={{
      backgroundImage: `url(/lightning-${props.color}.png)`,
      transform: `scale(${props.flip ? '-' : ''}${props.scale}, ${props.scale})`
    }}
  />
)

LightningBolt.defaultProps = {
  scale: 1
}

const LightningBolts = () => (
  <>
    {/* Left */}
    <LightningBolt
      color='yellow'
      className='top-4 xs:top-4 left-2 xs:left-4 sm:left-2 w-12 h-12 xs:w-24 xs:h-24 sm:w-28 sm:h-28'
    />
    <LightningBolt
      color='blue'
      className='top-16 xs:top-20 -left-2 xs:left-4 sm:left-2 w-12 h-12 xs:w-24 xs:h-24 sm:w-28 sm:h-28'
      scale={0.8}
    />
    {/* Right */}
    <LightningBolt
      flip
      color='yellow'
      scale={0.6}
      className='top-1 right-4 xs:right-4 sm:right-2 w-12 h-12 xs:w-24 xs:h-24 sm:w-28 sm:h-28'
    />
    <LightningBolt
      flip
      color='blue'
      className='top-14 -right-1 xs:top-16 xs:right-4 sm:right-2 w-12 h-12 xs:w-24 xs:h-24 sm:w-28 sm:h-28'
    />
  </>
)

const Dots = () => (
  <>
    {/* Left */}
    <Dot colorClassName='bg-gradient-magenta' positionClassName='-left-12 top-12' />
    <Dot colorClassName='bg-gradient-cyan' positionClassName='left-24 -top-4' />
    <Dot colorClassName='bg-pt-purple' positionClassName='top-0' />
    <Dot
      colorClassName='bg-gradient-cyan'
      positionClassName='bottom-10 left-2'
      className='transform -rotate-12'
      square
    />
    {/* Right */}
    <Dot
      colorClassName='bg-gradient-magenta'
      positionClassName='-top-5 right-32 xs:right-60'
      className='transform rotate-45'
      square
    />
    <Dot colorClassName='bg-gradient-yellow' positionClassName='right-8 -top-1' />
    <Dot colorClassName='bg-gradient-magenta' positionClassName='bottom-10 right-2' />
    <Dot
      colorClassName='bg-pt-purple'
      positionClassName='top-20 -right-2 sm:-right-8 transform -rotate-6'
      square
    />
  </>
)

const Dot = (props: {
  positionClassName: string
  colorClassName: string
  className?: string
  square: boolean
}) => (
  <div
    className={classNames(
      `w-2 h-2  absolute`,
      props.colorClassName,
      props.className,
      props.positionClassName,
      {
        'rounded-full': !props.square
      }
    )}
  />
)

Dot.defaultProps = {
  square: false
}
