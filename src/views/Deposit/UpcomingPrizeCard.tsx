import React from 'react'
import classNames from 'classnames'
import { Trans, useTranslation } from 'react-i18next'
import { ThemedClipSpinner, CountUp, TokenIcon } from '@pooltogether/react-components'
import { Token } from '@pooltogether/hooks'
import { PrizeTier } from '@pooltogether/v4-client-js'

import { useSelectedPrizePool } from '@hooks/v4/PrizePool/useSelectedPrizePool'
import { usePrizePoolTokens } from '@hooks/v4/PrizePool/usePrizePoolTokens'
import { useDrawBeaconPeriod } from '@hooks/v4/PrizePoolNetwork/useDrawBeaconPeriod'
import { useTimeUntil } from '@hooks/useTimeUntil'
import { roundPrizeAmount } from '@utils/roundPrizeAmount'
import { ViewPrizesSheetCustomTrigger } from '@components/ViewPrizesSheetButton'
import { useUpcomingPrizeTier } from '@hooks/useUpcomingPrizeTier'
import { Time } from '@components/Time'
import { calculateTotalNumberOfPrizes } from '@utils/calculateTotalNumberOfPrizes'
import { usePrizeDistributorToken } from '@hooks/v4/PrizeDistributor/usePrizeDistributorToken'
import { useSelectedPrizeDistributor } from '@hooks/v4/PrizeDistributor/useSelectedPrizeDistributor'

export const UpcomingPrizeCard = (props: { className?: string }) => {
  const { className } = props
  const { data: prizeTier, isFetched: isPrizeTierFetched } = useUpcomingPrizeTier()
  const prizeDistributor = useSelectedPrizeDistributor()
  const { data: prizeDistributorToken, isFetched: isPrizeTokenFetched } =
    usePrizeDistributorToken(prizeDistributor)

  const isFetched = isPrizeTierFetched && !!prizeTier && isPrizeTokenFetched

  return (
    <div className={classNames('flex flex-col text-center space-y-2 relative', className)}>
      <LightningBolts />
      <Dots />

      <AmountOfPrizes
        isFetched={isFetched}
        prizeTier={prizeTier}
        prizeToken={prizeDistributorToken?.token}
      />
      <PrizeAmount
        chainId={prizeDistributor.chainId}
        isFetched={isFetched}
        prizeTier={prizeTier}
        prizeToken={prizeDistributorToken?.token}
      />
      <DrawCountdown />
    </div>
  )
}

const AmountOfPrizes = (props: { isFetched: boolean; prizeToken: Token; prizeTier: PrizeTier }) => {
  const { isFetched, prizeToken, prizeTier } = props

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
              prizeToken={prizeToken}
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

const PrizeAmount = (props: {
  chainId: number
  isFetched: boolean
  prizeToken: Token
  prizeTier: PrizeTier
}) => {
  const { chainId, isFetched, prizeToken, prizeTier } = props

  let amount = 0
  if (isFetched) {
    amount = Number(roundPrizeAmount(prizeTier.prize, prizeToken.decimals).amount)
  }

  return (
    <div className='flex mx-auto space-x-2'>
      {isFetched && (
        <TokenIcon
          address={prizeToken.address}
          chainId={chainId}
          className='my-auto'
          sizeClassName='w-8 h-8 sm:w-10 sm:h-10 lg:w-12 lg:h-12'
        />
      )}
      <h1
        className={classNames(
          'text-10xl xs:text-13xl xs:-mt-0 font-semibold text-pt-gradient pointer-events-none leading-none relative space-x-2',
          { 'opacity-50': !amount }
        )}
      >
        <CountUp countTo={amount} />
        {!amount && (
          <ThemedClipSpinner sizeClassName='w-4 h-4' className='ml-2 absolute bottom-2' />
        )}
      </h1>
    </div>
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
        <span className='mt-1 h-14 uppercase font-semibold text-accent-1 text-xl mx-auto'>
          {t('closingSoon', 'Closing soon')}
        </span>
      </div>
    )
  }

  return (
    <div className='flex flex-col mx-auto pt-3'>
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
  <span {...props} className='uppercase font-semibold text-accent-4 text-xs xs:text-xs mx-auto' />
)

const LightningBolt = (props: {
  className: string
  color: string
  scale: number
  flip?: boolean
}) => {
  const { color } = props

  const fillBackgroundColor = color === 'yellow' ? '#FC9447' : '#0BF0B9'
  const fillForegroundColor = color === 'yellow' ? '#FFC448' : '#34FDCD'

  return (
    <div
      className={classNames(props.className, 'bg-contain bg-no-repeat absolute')}
      style={{
        transform: `rotate(${props.flip ? '' : '-'}10deg) scale(${props.flip ? '' : '-'}${
          props.scale
        }, ${props.scale})`
      }}
    >
      <svg viewBox='0 0 121 101' fill='none' xmlns='http://www.w3.org/2000/svg'>
        <path
          d='m78.667 12.83 43.728 10.131L133.441 50 83.64 60.695l10.217 8.885 4.695 24.71L7.9 98.809l-6.567-6.804 49.738-26.993-16.138-14.023 43.734-38.157Z'
          fill={fillBackgroundColor}
        />
        <path
          d='m78.667 12.83-.302 1.3 43.056 9.974 10.184 24.927L83.36 59.392c-.495.105-.884.48-1.01.97a1.33 1.33 0 0 0 .415 1.34l9.868 8.58 4.323 22.753-88.517 4.412L3.51 92.34l48.196-26.157c.384-.21.641-.594.689-1.027a1.338 1.338 0 0 0-.45-1.152L36.963 50.987l42.579-37.15-.876-1.006-.302 1.298.302-1.298-.876-1.004-43.734 38.157a1.334 1.334 0 0 0 .002 2.01l14.685 12.762L.697 90.832c-.368.2-.617.555-.681.97-.064.413.067.826.357 1.127l6.567 6.806c.268.277.64.425 1.027.405l90.652-4.517a1.333 1.333 0 0 0 1.242-1.582l-4.694-24.71a1.345 1.345 0 0 0-.435-.758l-8.204-7.134 47.193-10.135a1.332 1.332 0 0 0 .955-1.808l-11.047-27.04a1.34 1.34 0 0 0-.933-.795L78.968 11.532a1.33 1.33 0 0 0-1.177.295l.876 1.004'
          fill='#11131A'
        />
        <path
          d='m66.417 2.299 55.978 20.662-51.026 27.196 22.43 19.49L1.334 92.004l37.478-37.53-16.138-14.02L66.417 2.3'
          fill={fillForegroundColor}
        />
        <path
          d='m66.417 2.299-.461 1.25 53.188 19.634L70.743 48.98a1.338 1.338 0 0 0-.698 1.027c-.049.433.12.87.45 1.156l20.48 17.795L5.623 89.595l34.132-34.179c.262-.263.402-.619.389-.99a1.328 1.328 0 0 0-.459-.958L24.704 40.452l42.59-37.15-.877-1.003-.461 1.25.461-1.25-.876-1.006L21.797 39.45a1.335 1.335 0 0 0 .001 2.012l15.06 13.082L.388 91.06a1.338 1.338 0 0 0-.218 1.596c.292.519.896.783 1.476.643l92.466-22.357a1.334 1.334 0 0 0 .56-2.303L73.708 50.423l49.313-26.286a1.33 1.33 0 0 0 .704-1.266 1.327 1.327 0 0 0-.869-1.16L66.88 1.047c-.46-.17-.97-.075-1.339.246l.876 1.006'
          fill='#11131A'
        />
      </svg>
    </div>
  )
}

LightningBolt.defaultProps = {
  scale: 1
}

const LightningBolts = () => (
  <>
    {/* Left */}
    <LightningBolt
      color='yellow'
      className='top-4 xs:top-4 -left-1 xs:left-4 sm:left-8 w-8 h-8 xs:w-12 xs:h-12'
    />
    <LightningBolt
      color='teal'
      className='top-14 xs:pt-2 left-1 xs:left-4 sm:left-10 w-8 h-8 xs:w-12 xs:h-12'
      scale={0.8}
    />
    {/* Right */}
    <LightningBolt
      flip
      color='yellow'
      scale={0.7}
      className='xs:top-1 -right-2 xs:right-4 sm:right-10 w-10 h-10 xs:w-12 xs:h-12'
    />
    <LightningBolt
      flip
      color='teal'
      className='top-14 right-1 xs:top-16 xs:right-4 sm:right-14 w-8 h-8 xs:w-12 xs:h-12'
    />
  </>
)

const Dots = () => (
  <>
    {/* Left */}
    <Dot
      colorClassName='bg-gradient-cyan'
      positionClassName='left-24 -top-4'
      className='hidden sm:block opacity-40'
    />
    <Dot colorClassName='bg-pt-purple' positionClassName='top-0' className='hidden sm:block' />
    <Dot
      colorClassName='bg-gradient-cyan'
      positionClassName='bottom-10 left-2'
      className='hidden sm:block transform -rotate-12 opacity-40'
      square
    />
    {/* Right */}
    <Dot
      colorClassName='bg-gradient-cyan'
      positionClassName='-top-2 right-32 xs:right-12'
      className='hidden sm:block transform rotate-45 opacity-40'
      square
    />
    <Dot
      colorClassName='bg-gradient-cyan'
      positionClassName='bottom-10 right-2'
      className='hidden sm:block opacity-40'
    />
    <Dot
      colorClassName='bg-pt-purple'
      positionClassName='top-20 -right-2 sm:-right-8 transform -rotate-6'
      className='hidden sm:block'
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
