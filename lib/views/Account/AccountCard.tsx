import React from 'react'
import { Card, CardTheme, ThemedClipSpinner, Tooltip } from '@pooltogether/react-components'

import CardCornerLight from './card-corner-light.png'
import { ColorTheme, useTheme } from 'lib/hooks/useTheme'
import { Player } from '@pooltogether/v4-js-client'
import classNames from 'classnames'
import { Amount } from '@pooltogether/hooks'
import { useUsersUpcomingOddsOfWinningAPrize } from 'lib/hooks/Tsunami/useUsersUpcomingOddsOfWinningAPrize'
import { ManageBalancesList } from 'lib/views/Account/ManageBalancesList'
import { useTranslation } from 'react-i18next'
import { XDollarsGetsYou } from 'lib/components/XDollarsGetsYou'

interface AccountCardProps {
  className?: string
  player: Player
  isPlayerFetched: boolean
}

export const AccountCard = (props: AccountCardProps) => {
  const { className, player, isPlayerFetched } = props
  const { theme } = useTheme()
  // const { data: twabs, isFetched, isPartiallyFetched } = useUsersCurrentPrizePoolTwabs()
  const backgroundImage = theme === ColorTheme.dark ? CardCornerLight : CardCornerLight

  return (
    <div className='flex flex-col'>
      <Card
        className={classNames(className, 'w-full bg-contain bg-no-repeat flex flex-col')}
        theme={CardTheme.purple}
        style={{ backgroundImage: `url(${backgroundImage})` }}
      >
        <div className='ml-auto mb-12 flex flex-col mt-3 sm:mt-0'>
          <WinningOdds />
          {/* <Twab twabs={twabs} isFetched={isFetched} isPartiallyFetched={isPartiallyFetched} /> */}
        </div>
        <ManageBalancesList player={player} isFetched={isPlayerFetched} />
      </Card>
      <OddsDisclaimer />
    </div>
  )
}

// TODO: WIP
const Twab = (props) => {
  const { twabs, isFetched, isPartiallyFetched } = props
  return (
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
      className={classNames(className, 'font-bold leading-none', {
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

const WinningOdds = () => {
  const { data, isFetched } = useUsersUpcomingOddsOfWinningAPrize()
  const { t } = useTranslation()

  if (!isFetched) {
    return (
      <div className='ml-auto'>
        <ThemedClipSpinner sizeClassName='w-6 h-6' className='mb-4' />
      </div>
    )
  }

  const { odds, oneOverOdds } = data

  if (odds === 0) {
    return (
      <div className='ml-auto flex flex-col leading-none space-y-1'>
        <span className='ml-auto'>🌊🏆</span>
        <span className='font-bold ml-auto'>
          {t('makeADepositForAChanceToWin', 'Make a deposit for a chance to win!')}
        </span>
        <span className='ml-auto text-right'>
          <XDollarsGetsYou x='100' />
          <span className='opacity-40'>*</span>
        </span>
      </div>
    )
  }

  return (
    <div className='ml-auto flex leading-none'>
      <span className='mr-1 mt-1'>{t('winningOdds')}</span>
      <div className='font-bold flex'>
        <span className='text-5xl'>1</span>
        <span className='mx-1 my-auto'>in</span>
        <span className='text-5xl'>{oneOverOdds.toFixed(2)}</span>
      </div>
      <span className='opacity-40'>*</span>
    </div>
  )
}

export const OddsDisclaimer = (props: { className?: string }) => {
  const { t } = useTranslation()
  return (
    <span className={classNames('opacity-40 text-xxs text-center mx-auto mt-4', props.className)}>
      *<span>{t('oddsDisclaimer')}</span>
      <a
        href='https://docs.pooltogether.com/faq/prizes-and-winning'
        target='_blank'
        rel='noopener noreferrer'
        className='underline ml-1 text-xxs'
      >
        {t('readMore')}.
      </a>
    </span>
  )
}
