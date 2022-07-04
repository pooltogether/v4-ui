import React from 'react'
import FeatherIcon from 'feather-icons-react'
import { ThemedClipSpinner, CountUp } from '@pooltogether/react-components'
import { useTranslation } from 'react-i18next'
import { ethers } from 'ethers'
import { Amount } from '@pooltogether/hooks'
import classNames from 'classnames'

import { useUsersAddress } from '@pooltogether/wallet-connection'
import { TotalWinningsCard } from './TotalWinnings'
import { useUsersTotalBalances } from '@hooks/useUsersTotalBalances'
import WalletIllustration from '@assets/images/wallet-illustration.png'

interface AccountCardProps {
  className?: string
}

export const AccountCard = (props: AccountCardProps) => {
  return (
    <div className={classNames('flex flex-col p-4 space-y-2', props.className)}>
      <div className='flex justify-between p-4'>
        <TotalBalance />
        <img src={WalletIllustration} style={{ width: '65px', height: '60px' }} />
      </div>
      <div className='flex space-x-2'>
        <DailyOdds />
        <WeeklyOdds />
      </div>
      <TotalWinningsCard className='block sm:hidden' />
    </div>
  )
}

const TotalBalance = (props: { className?: string }) => {
  const { className } = props
  const { t } = useTranslation()
  const { data, isFetching, isFetched } = useUsersTotalBalances()
  return (
    <a href='#deposits' className={className}>
      <span className='font-semibold uppercase text-xs'>{t('totalBalance', 'Total balance')}</span>
      <span className='leading-none flex text-2xl xs:text-4xl font-bold relative'>
        <TotalBalanceAmount />
        {isFetching ? (
          <ThemedClipSpinner sizeClassName='w-4 h-4' className='ml-2 my-auto' />
        ) : (
          <FeatherIcon icon='chevron-right' className='w-6 h-6 opacity-50 my-auto ml-1' />
        )}
      </span>
    </a>
  )
}

export const TotalBalanceAmount = () => {
  const { data, isFetching, isFetched } = useUsersTotalBalances()

  if (isFetching) {
    return <ThemedClipSpinner sizeClassName='w-4 h-4' className='ml-2 my-auto' />
  }

  // If not fetched
  // If no token price or balance
  if (
    !isFetched ||
    !data?.totalBalanceUsd.amountUnformatted.isZero() ||
    (data?.totalBalanceUsd.amountUnformatted.isZero() && !data?.totalV4Balance)
  ) {
    return (
      <>
        $<CountUp countTo={Number(data?.totalBalanceUsd.amount)} />
      </>
    )
  }

  return <CountUp countTo={Number(data?.totalV4Balance)} />
}

const DailyOdds = () => <OddsBox i18nKey='dailyOdds' daysOfPrizes={1} />
const WeeklyOdds = () => <OddsBox i18nKey='weeklyOdds' daysOfPrizes={7} />

const OddsBox = (props: { i18nKey: string; daysOfPrizes: number }) => {
  return null

  const { i18nKey, daysOfPrizes } = props
  const usersAddress = useUsersAddress()
  const data = useUsersUpcomingOddsOfWinningAPrizeOnAnyNetwork(
    usersAddress,
    EstimateAction.none,
    ethers.constants.Zero,
    daysOfPrizes
  )
  const { t } = useTranslation()

  if (!Boolean(data)) {
    return (
      <div className='bg-white bg-opacity-20 dark:bg-actually-black dark:bg-opacity-10 rounded-lg w-full p-4 flex flex-col leading-none text-center'>
        <ThemedClipSpinner sizeClassName='w-5 h-5' className='mx-auto' />
      </div>
    )
  }

  const { odds, oneOverOdds } = data

  if (odds === 0) {
    return (
      <div className='bg-white bg-opacity-20 dark:bg-actually-black dark:bg-opacity-10 rounded-lg w-full p-4 flex flex-col leading-none text-center'>
        <span className='font-bold flex text-lg mx-auto'>
          {daysOfPrizes === 1 ? '0 😔' : t('stillZero', 'Still 0')}
        </span>
        <span className='mt-1 opacity-50 font-bold uppercase'>{t(i18nKey)}*</span>
      </div>
    )
  }

  const oneOverOddstring = Number(oneOverOdds.toFixed(2)) < 1.01 ? 1 : oneOverOdds.toFixed(2)

  return (
    <div className='bg-white bg-opacity-20 dark:bg-actually-black dark:bg-opacity-10 rounded-lg w-full p-4 flex flex-col leading-none text-center'>
      <span className='font-bold flex text-lg mx-auto'>1:{oneOverOddstring}</span>
      <span className='mt-1 opacity-50 font-bold uppercase'>{t(i18nKey)}*</span>
    </div>
  )
}
