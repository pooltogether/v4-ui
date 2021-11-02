import React from 'react'
import { Card, CardTheme, ThemedClipSpinner, Tooltip } from '@pooltogether/react-components'

import CardCornerLight from './card-corner-light.png'
import CardCornerDark from './card-corner-dark.png'
import { ColorTheme, useTheme } from 'lib/hooks/useTheme'
import { Player } from '@pooltogether/v4-js-client'
import classNames from 'classnames'
import { useUsersCurrentPrizePoolTwabs } from 'lib/hooks/Tsunami/PrizePool/useUsersCurrentPrizePoolTwabs'
import { Amount } from '@pooltogether/hooks'
import { useUsersUpcomingOddsOfWinningAPrize } from 'lib/hooks/Tsunami/useUsersUpcomingOddsOfWinningAPrize'
import { ManageBalancesList } from 'lib/views/Account/ManageBalancesList'

interface AccountCardProps {
  className?: string
  player: Player
  isPlayerFetched: boolean
}

export const AccountCard = (props: AccountCardProps) => {
  const { className, player, isPlayerFetched } = props
  const { theme } = useTheme()
  const { data: twabs, isFetched, isPartiallyFetched } = useUsersCurrentPrizePoolTwabs()
  const backgroundImage = theme === ColorTheme.dark ? CardCornerLight : CardCornerLight

  return (
    <div className='flex flex-col'>
      <Card
        className={classNames(className, 'w-full bg-contain bg-no-repeat flex flex-col')}
        theme={CardTheme.purple}
        style={{ backgroundImage: `url(${backgroundImage})` }}
      >
        <div className='ml-auto mb-6 flex flex-col sm:mt-0'>
          <div className='flex'>
            <div className='flex mr-2'>
              <TwabToolTip />
              <span className='opacity-80'>Total chance</span>
            </div>
            <TwabAmount
              amount={twabs?.total}
              isFetched={isFetched}
              isPartiallyFetched={isPartiallyFetched}
            />
          </div>
          <OddsOfWinningOnePrize />
        </div>
        <ManageBalancesList player={player} isFetched={isPlayerFetched} />
      </Card>
      <OddsDisclaimer />
    </div>
  )
}

const TwabToolTip = () => {
  return (
    <Tooltip
      tip='Total chance includes the winning power delegated to you from other sources.'
      iconClassName='mr-1 h-4 w-4 opacity-80'
      className='mt-1'
    />
  )
}

const TwabAmount = (props: {
  amount: Amount
  isFetched: boolean
  isPartiallyFetched: boolean
  className?: string
}) => {
  const { amount, className, isPartiallyFetched, isFetched } = props

  let amountToDisplay = '--'
  if (isPartiallyFetched) {
    amountToDisplay = amount.amountPretty
  }

  return (
    <span
      className={classNames(className, 'text-5xl font-bold leading-none', {
        'opacity-70': !isPartiallyFetched
      })}
    >
      {amountToDisplay}
      {isPartiallyFetched && !isFetched && (
        <ThemedClipSpinner sizeClassName='w-4 h-4' className='absolute' />
      )}
    </span>
  )
}

const OddsOfWinningOnePrize = () => {
  const {
    data: { oneOverOdds }
  } = useUsersUpcomingOddsOfWinningAPrize()
  return (
    <div className='ml-auto'>
      <span>Winning odds: </span>
      <span className='font-bold'>1 in {oneOverOdds?.toFixed(2)}</span>
      <span className='opacity-40'>*</span>
    </div>
  )
}

const OddsDisclaimer = () => {
  return (
    <span className='opacity-40 text-xxs text-center mx-auto mt-4'>
      * Odds calculation is an estimate based on current data and is subject to change.
    </span>
  )
}
