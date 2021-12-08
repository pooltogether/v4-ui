import React from 'react'
import FeatherIcon from 'feather-icons-react'
import { ColorTheme, ThemedClipSpinner, Tooltip } from '@pooltogether/react-components'
import { useTranslation } from 'react-i18next'
import Image from 'next/image'

import CardCornerLight from '../card-corner-light.png'
import { useTheme } from 'lib/hooks/useTheme'
import { User } from '@pooltogether/v4-js-client'
import classNames from 'classnames'
import { Amount } from '@pooltogether/hooks'
import { useUsersUpcomingOddsOfWinningAPrizeOnAnyNetwork } from 'lib/hooks/Tsunami/useUsersUpcomingOddsOfWinningAPrizeOnAnyNetwork'
import { XDollarsGetsYou } from 'lib/components/XDollarsGetsYou'
import { useUsersAddress } from 'lib/hooks/useUsersAddress'
import { TotalWinnings } from './TotalWinnings'

import walletIllustration from 'public/wallet-illustration.png'
import { useUsersTotalPrizePoolBalances } from 'lib/hooks/Tsunami/PrizePool/useUsersTotalPrizePoolBalances'
import { CountUp } from 'lib/components/CountUp'

interface AccountCardProps {
  className?: string
  user: User
}
export const AccountCard = (props: AccountCardProps) => {
  const { user } = props

  return (
    <div className='flex flex-col p-4 pink-purple-gradient rounded-2xl'>
      <div className='flex justify-between p-4'>
        <TotalBalance user={user} />
        <Image src={walletIllustration} width='55px' height='60px' />
      </div>
      <TotalWinnings />
    </div>
  )
}

const TotalBalance = (props: { className?: string; user: User }) => {
  const { className, user } = props
  const { t } = useTranslation()
  const { data: totalBalances, isFetched } = useUsersTotalPrizePoolBalances()
  return (
    <a href='#balance' className={className}>
      <span className='uppercase text-xs'>{t('totalBalance', 'Total balance')}</span>
      <h2 className='leading-none flex'>
        $<CountUp countTo={isFetched ? Number(totalBalances.totalBalance.amount) : 0} />
        {!isFetched && (
          <ThemedClipSpinner sizeClassName='w-4 h-4' className='ml-2 absolute bottom-2' />
        )}
        <FeatherIcon icon='chevron-right' className='w-6 h-6 opacity-50 my-auto ml-1' />
      </h2>
    </a>
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
  const usersAddress = useUsersAddress()
  const data = useUsersUpcomingOddsOfWinningAPrizeOnAnyNetwork(usersAddress)
  const { t } = useTranslation()

  if (!Boolean(data)) {
    return (
      <div className='ml-auto'>
        <ThemedClipSpinner sizeClassName='w-6 h-6' className='mb-4' />
      </div>
    )
  }

  const { odds, oneOverOdds } = data[usersAddress]

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
