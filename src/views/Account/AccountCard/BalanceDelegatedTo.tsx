import React, { useState } from 'react'
import FeatherIcon from 'feather-icons-react'
import { BigNumber } from 'ethers'
import { Trans, useTranslation } from 'react-i18next'
import { Tooltip, ThemedClipSpinner, TokenIcon, CountUp } from '@pooltogether/react-components'
import { Amount, Token } from '@pooltogether/hooks'
import { Draw } from '@pooltogether/v4-client-js'
import { numberWithCommas } from '@pooltogether/utilities'

import TrophyIcon from '@assets/images/pooltogether-trophy--detailed.svg'
import { BottomSheet } from '@components/BottomSheet'
import { useUsersTotalBalances } from '@hooks/useUsersTotalBalances'
import { useUsersAddress } from '@hooks/useUsersAddress'
import { useUsersTotalTwab } from '@hooks/v4/PrizePool/useUsersTotalTwab'
import { useAllUsersPositiveClaimedAmountsWithDraws } from '@hooks/v4/PrizeDistributor/useAllUsersPositiveClaimedAmountsWithDraws'
import { getTimestampString } from '@utils/getTimestampString'

export const BalanceDelegatedTo = () => {
  const [isOpen, setIsOpen] = useState(false)
  const usersAddress = useUsersAddress()
  const { t } = useTranslation()

  const { data: twabs, isFetched: isTwabsFetched } = useUsersTotalTwab(usersAddress)
  const { data, isFetched: isUsersTotalBalancesFetched } = useUsersTotalBalances()
  const isFetched = isTwabsFetched && isUsersTotalBalancesFetched

  const totalV4Balance = data?.totalV4Balance.toString()
  const usersTotalV4TwabBalance = twabs?.twab.amount
  const delegatedToAmount = Number(usersTotalV4TwabBalance) - Number(totalV4Balance)

  const debugBox = (
    <div className='shadow-2xl absolute r-8 b-2 w-128 h-32 bg-white rounded-xl text-primary p-4 font-bold z-40'>
      <div className='inline-block w-48 font-normal text-black'>usersTotalV4TwabBalance:</div>{' '}
      {usersTotalV4TwabBalance}
      <br />
      <div className='inline-block w-48 font-normal text-black'>totalV4Balance:</div>{' '}
      {totalV4Balance}
      <br />
      <hr className='my-1 bg-pt-purple w-full' />
      <div className='inline-block w-48 font-normal text-black'>delegatedToAmount:</div>{' '}
      {delegatedToAmount}
    </div>
  )

  return (
    <>
      {debugBox}
      <button
        onClick={() => setIsOpen(true)}
        className='px-2 py-4 xs:px-4 bg-white bg-opacity-20 dark:bg-actually-black dark:bg-opacity-10 rounded-lg flex justify-between font-bold text-inverse'
      >
        <span className='flex items-center '>
          <span className='mr-1'>{'🎁 '}</span>
          {t('totalDelegatedToYou', 'Total delegated to you')}
          <span className='ml-1'>
            <Tooltip
              id={`tooltip-vapr`}
              tip={t(
                'delegationDescription',
                'Other people can delegate their chances of winning to you. This is typically used for winners of competitions or for charity.'
              )}
              iconClassName='opacity-50 relative hover:opacity-100 transition'
            />
          </span>
        </span>
        <div className='flex'>
          <span className='relative rounded-full bg-white bg-opacity-20 dark:bg-actually-black dark:bg-opacity-10 px-3'>
            {!isFetched ? (
              <ThemedClipSpinner sizeClassName='w-3 h-3' className='mx-auto' />
            ) : (
              <>
                $<CountUp countTo={isFetched ? Number(delegatedToAmount) : 0} />
              </>
            )}
          </span>
          <FeatherIcon icon='chevron-right' className='w-6 h-6 opacity-50 my-auto ml-1' />
        </div>
      </button>
      <DelegationBreakdownSheet
        usersTotalV4TwabBalance={usersTotalV4TwabBalance}
        totalV4Balance={totalV4Balance}
        delegatedToAmount={delegatedToAmount}
        open={isOpen}
        onDismiss={() => setIsOpen(false)}
      />
    </>
  )
}

interface DelegationBreakdownSheetProps {
  usersTotalV4TwabBalance: string
  totalV4Balance: string
  delegatedToAmount: number
  open: boolean
  onDismiss: () => void
}

const DelegationBreakdownSheet = (props: DelegationBreakdownSheetProps) => {
  const { open, onDismiss, delegatedToAmount } = props
  const { t } = useTranslation()

  return (
    <BottomSheet open={open} onDismiss={onDismiss} className='flex flex-col space-y-8'>
      <div className='flex items-center mx-auto'>
        <h1 className='mr-3'>🎁</h1>
        <div className='flex flex-col leading-none'>
          <span className='font-bold text-xl mb-1'>${delegatedToAmount}</span>
          <span className='uppercase opacity-50 font-semibold text-xxs'>
            {t('totalDelegatedToYou')}
          </span>
        </div>
      </div>
      <p className='text-accent-1 text-xs'>
        {t(
          'delegationDescription',
          'Other people can delegate their chances of winning to you. This is typically used for winners of competitions or for charity.'
        )}
      </p>
      <a
        target='_blank'
        href='https://docs.pooltogether.com/how-to/how-to-delegate'
        className='text-highlight-1'
      >
        {t('readMoreHere', 'Read more here')}
        <FeatherIcon icon='external-link' className='inline-block w-4 h-4 ml-1' />
      </a>
    </BottomSheet>
  )
}
