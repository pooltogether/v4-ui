import React from 'react'
import FeatherIcon from 'feather-icons-react'
import { ThemedClipSpinner, CountUp } from '@pooltogether/react-components'
import { useTranslation } from 'react-i18next'
import { ethers } from 'ethers'
import { User } from '@pooltogether/v4-client-js'
import { Amount } from '@pooltogether/hooks'

import { useUsersUpcomingOddsOfWinningAPrizeOnAnyNetwork } from '@hooks/v4/Odds/useUsersUpcomingOddsOfWinningAPrizeOnAnyNetwork'
import { useUsersAddress } from '@hooks/useUsersAddress'
import { TotalWinnings } from './TotalWinnings'
import { useUsersTotalBalances } from '@hooks/useUsersTotalBalances'
import { EstimateAction } from '@hooks/v4/Odds/useEstimatedOddsForAmount'

import WalletIllustration from '@assets/images/wallet-illustration.png'

interface AccountCardProps {
  className?: string
  user: User
}
export const AccountCard = (props: AccountCardProps) => {
  const { user } = props

  return (
    <div className='flex flex-col p-4 pink-purple-gradient rounded-lg space-y-2'>
      <div className='flex justify-between p-4'>
        <TotalBalance user={user} />
        <img src={WalletIllustration} style={{ width: '65px', height: '60px' }} />
      </div>
      <div className='flex space-x-2'>
        <DailyOdds />
        <WeeklyOdds />
      </div>
      <TotalWinnings />
    </div>
  )
}

const TotalBalance = (props: { className?: string; user: User }) => {
  const { className } = props
  const { t } = useTranslation()
  const { data, isFetching, isFetched } = useUsersTotalBalances()
  return (
    <a href='#deposits' className={className}>
      <span className='font-semibold uppercase text-xs'>{t('totalBalance', 'Total balance')}</span>
      <span className='leading-none flex text-2xl xs:text-4xl font-bold relative'>
        <TotalBalanceAmount
          isFetched={isFetched}
          totalBalanceUsd={data.totalBalanceUsd}
          totalV4Balance={data.totalV4Balance}
        />
        {isFetching ? (
          <ThemedClipSpinner sizeClassName='w-4 h-4' className='ml-2 my-auto' />
        ) : (
          <FeatherIcon icon='chevron-right' className='w-6 h-6 opacity-50 my-auto ml-1' />
        )}
      </span>
    </a>
  )
}

const TotalBalanceAmount = (props: {
  totalBalanceUsd: Amount
  totalV4Balance: number
  isFetched: boolean
}) => {
  const { totalBalanceUsd, totalV4Balance, isFetched } = props
  // If not fetched
  // If no token price or balance
  // If token price
  if (
    !isFetched ||
    !totalBalanceUsd.amountUnformatted.isZero() ||
    (totalBalanceUsd.amountUnformatted.isZero() && !totalV4Balance)
  ) {
    return (
      <>
        $<CountUp countTo={Number(totalBalanceUsd.amount)} />
      </>
    )
  }

  return <CountUp countTo={Number(totalV4Balance)} />
}

const DailyOdds = () => <OddsBox i18nKey='dailyOdds' daysOfPrizes={1} />
const WeeklyOdds = () => <OddsBox i18nKey='weeklyOdds' daysOfPrizes={7} />

const OddsBox = (props: { i18nKey: string; daysOfPrizes: number }) => {
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
