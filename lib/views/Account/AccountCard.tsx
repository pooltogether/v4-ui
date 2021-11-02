import React from 'react'
import { Card, CardTheme, ThemedClipSpinner, Tooltip } from '@pooltogether/react-components'

import CardCornerLight from './card-corner-light.png'
import CardCornerDark from './card-corner-dark.png'
import { ColorTheme, useTheme } from 'lib/hooks/useTheme'
import { Player } from '@pooltogether/v4-js-client'
import classNames from 'classnames'
import { useUsersCurrentPrizePoolTwabs } from 'lib/hooks/Tsunami/PrizePool/useUsersCurrentPrizePoolTwabs'
import { Amount } from '@pooltogether/hooks'

interface AccountCardProps {
  className?: string
  player: Player
  isPlayerFetched: boolean
}

export const AccountCard = (props: AccountCardProps) => {
  const { className } = props
  const { theme } = useTheme()
  const { data: twabs, isFetched, isPartiallyFetched } = useUsersCurrentPrizePoolTwabs()
  const backgroundImage = theme === ColorTheme.dark ? CardCornerLight : CardCornerLight

  return (
    <Card
      className={classNames(className, 'w-full bg-cover flex flex-col')}
      theme={CardTheme.purple}
      style={{ backgroundImage: `url(${backgroundImage})` }}
    >
      <div className='ml-auto mb-6 flex'>
        <TwabToolTip />
        <TwabAmount
          amount={twabs?.total}
          isFetched={isFetched}
          isPartiallyFetched={isPartiallyFetched}
        />
      </div>
      <div className='bg-body w-full h-20 rounded'></div>
    </Card>
  )
}

const TwabToolTip = () => {
  return (
    <Tooltip
      tip='This is some copy explaining this number'
      iconClassName='mr-2'
      className='my-auto'
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
