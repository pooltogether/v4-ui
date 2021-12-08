import { BottomSheet, snapTo90 } from 'lib/components/BottomSheet'
import FeatherIcon from 'feather-icons-react'
import React, { useState } from 'react'
import { useTranslation } from 'react-i18next'
import { useUsersTotalClaimedAmount } from 'lib/hooks/Tsunami/PrizeDistributor/useUsersTotalClaimedAmount'
import { useUsersAddress } from 'lib/hooks/useUsersAddress'
import { CountUp } from 'lib/components/CountUp'
import { ThemedClipSpinner } from '@pooltogether/react-components'
import TrophyIcon from 'assets/images/pooltogether-trophy--detailed.svg'
import { Amount } from '@pooltogether/hooks'
import { useAllUsersClaimedAmounts } from 'lib/hooks/Tsunami/PrizeDistributor/useAllUsersClaimedAmounts'
import { useAllUsersPositiveClaimedAmountsWithDraws } from 'lib/hooks/Tsunami/PrizeDistributor/useAllUsersPositiveClaimedAmountsWithDraws'
import { Draw } from '@pooltogether/v4-js-client'

export const TotalWinnings = () => {
  const [isOpen, setIsOpen] = useState(false)
  const usersAddress = useUsersAddress()
  const { data: totalClaimedAmount, isFetched } = useUsersTotalClaimedAmount(usersAddress)
  const { t } = useTranslation()

  return (
    <>
      <button
        onClick={() => setIsOpen(true)}
        className='p-4 bg-white bg-opacity-20 dark:bg-actually-black dark:bg-opacity-10 rounded-lg flex justify-between font-bold text-inverse'
      >
        <span>
          {'🎉 '}
          {t('totalWinningsExclamation')}
        </span>
        <div className='flex'>
          <span className='rounded-full bg-white bg-opacity-20 dark:bg-actually-black dark:bg-opacity-10 px-3'>
            $<CountUp countTo={isFetched ? Number(totalClaimedAmount.amount) : 0} />
            {!isFetched && (
              <ThemedClipSpinner sizeClassName='w-4 h-4' className='ml-2 absolute bottom-2' />
            )}
          </span>
          <FeatherIcon icon='chevron-right' className='w-6 h-6 opacity-50 my-auto ml-1' />
        </div>
      </button>
      <TotalWinningsSheet
        totalClaimedAmount={totalClaimedAmount}
        open={isOpen}
        onDismiss={() => setIsOpen(false)}
      />
    </>
  )
}

interface TotalWinningsSheetProps {
  totalClaimedAmount: Amount
  open: boolean
  onDismiss: () => void
}

const TotalWinningsSheet = (props: TotalWinningsSheetProps) => {
  const { open, onDismiss, totalClaimedAmount } = props
  const { t } = useTranslation()

  return (
    <BottomSheet open={open} onDismiss={onDismiss} className='flex flex-col space-y-8'>
      <div className='flex items-center mx-auto'>
        <img src={TrophyIcon} className='mr-2' style={{ width: '38px' }} />
        <div className='flex flex-col leading-none'>
          <span className='font-bold text-xl mb-1'>
            ${totalClaimedAmount?.amountPretty || '--'}
          </span>
          <span className='uppercase opacity-50 font-semibold text-xxs'>{t('totalWinnings')}</span>
        </div>
      </div>
      <PrizesClaimedList />
    </BottomSheet>
  )
}

interface PrizesClaimedListProps {}

const PrizesClaimedList = (props: PrizesClaimedListProps) => {
  const usersAddress = useUsersAddress()
  const { data, isFetched } = useAllUsersPositiveClaimedAmountsWithDraws(usersAddress)

  return (
    <ul className='space-y-3 bg-actually-black bg-opacity-10 dark:bg-white dark:bg-opacity-5 p-4 rounded-lg max-h-80 overflow-y-auto'>
      {!isFetched ? (
        <>
          <LoadingRow />
          <LoadingRow />
          <LoadingRow />
        </>
      ) : (
        data.map((data) => <ClaimedPrizeItem {...data} />)
      )}
    </ul>
  )
}

const ClaimedPrizeItem = (props: {
  prizeDistributorId: string
  chainId: number
  drawId: number
  claimedAmount: Amount
  draw: Draw
}) => {
  return <li></li>
}

const LoadingRow = () => (
  <div className='rounded-lg bg-actually-black bg-opacity-20 dark:bg-white dark:bg-opacity-10 animate-pulse w-full h-10' />
)
