import React from 'react'
import FeatherIcon from 'feather-icons-react'
import { ThemedClipSpinner } from '@pooltogether/react-components'
import { useTranslation } from 'react-i18next'
import Image from 'next/image'

import { User } from '@pooltogether/v4-js-client'
import { useUsersUpcomingOddsOfWinningAPrizeOnAnyNetwork } from 'lib/hooks/Tsunami/useUsersUpcomingOddsOfWinningAPrizeOnAnyNetwork'
import { XDollarsGetsYou } from 'lib/components/XDollarsGetsYou'
import { useUsersAddress } from 'lib/hooks/useUsersAddress'
import { TotalWinnings } from './TotalWinnings'

import walletIllustration from 'public/wallet-illustration.png'
import { useUsersTotalPrizePoolBalances } from 'lib/hooks/Tsunami/PrizePool/useUsersTotalPrizePoolBalances'
import { CountUp } from 'lib/components/CountUp'
import { EstimateAction } from 'lib/hooks/Tsunami/useEstimatedOddsForAmount'
import { ethers } from 'ethers'

interface AccountCardProps {
  className?: string
  user: User
}
export const AccountCard = (props: AccountCardProps) => {
  const { user } = props

  return (
    <div className='flex flex-col p-4 pink-purple-gradient rounded-2xl space-y-2'>
      <div className='flex justify-between p-4'>
        <TotalBalance user={user} />
        <img src={walletIllustration} style={{ width: '55px', height: '60px' }} />
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
  const { className, user } = props
  const { t } = useTranslation()
  const { data: totalBalances, isFetched } = useUsersTotalPrizePoolBalances()
  return (
    <a href='#deposits' className={className}>
      <span className='uppercase text-xs font-semibold'>{t('totalBalance', 'Total balance')}</span>
      <span className='leading-none flex text-2xl xs:text-4xl font-bold'>
        $<CountUp countTo={isFetched ? Number(totalBalances.totalBalance.amount) : 0} />
        {!isFetched && (
          <ThemedClipSpinner sizeClassName='w-4 h-4' className='ml-2 absolute bottom-2' />
        )}
        <FeatherIcon icon='chevron-right' className='w-6 h-6 opacity-50 my-auto ml-1' />
      </span>
    </a>
  )
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
