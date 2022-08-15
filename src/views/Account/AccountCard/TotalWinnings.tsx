import FeatherIcon from 'feather-icons-react'
import React, { useState } from 'react'
import { Trans, useTranslation } from 'react-i18next'
import { ThemedClipSpinner, TokenIcon, CountUp, BottomSheet } from '@pooltogether/react-components'
import { Amount, Token } from '@pooltogether/hooks'
import { Draw } from '@pooltogether/v4-client-js'
import { useUsersAddress } from '@pooltogether/wallet-connection'

import TrophyIcon from '@assets/images/pooltogether-trophy--detailed.svg'
import { useAllUsersPositiveClaimedAmountsWithDraws } from '@hooks/v4/PrizeDistributor/useAllUsersPositiveClaimedAmountsWithDraws'
import { getTimestampString } from '@utils/getTimestampString'
import classNames from 'classnames'
import { useUsersTotalClaimedAmountGraph } from '@hooks/v4/PrizeDistributor/useUsersTotalClaimedAmountGraph'
import { useAllUsersClaimedAmountsGraph } from '@hooks/v4/PrizeDistributor/useAllUsersClaimedAmountsGraph'

export const TotalWinningsAmount: React.FC<{ className?: string }> = (props) => {
  const { className } = props
  const usersAddress = useUsersAddress()
  const { data: totalClaimedAmount, isFetched } = useUsersTotalClaimedAmountGraph(usersAddress)

  return (
    <span className={className}>
      {!isFetched ? (
        <ThemedClipSpinner sizeClassName='w-3 h-3' className='mx-auto' />
      ) : (
        <>
          $<CountUp countTo={isFetched ? Number(totalClaimedAmount.amount) : 0} />
        </>
      )}
    </span>
  )
}

export const TotalWinningsCard: React.FC<{ className?: string }> = (props) => {
  const { className } = props
  const [isOpen, setIsOpen] = useState(false)
  const { t } = useTranslation()

  return (
    <>
      <button
        onClick={() => setIsOpen(true)}
        className={classNames(
          className,
          'p-4 bg-white bg-opacity-20 dark:bg-actually-black dark:bg-opacity-10 hover:bg-white rounded-lg font-bold text-inverse'
        )}
      >
        <div className='flex justify-between w-full'>
          <span>
            <span className='mr-1'>{'🎉 '}</span>
            {t('totalClaimedWinningsExclamation', 'Total claimed winnings!')}
          </span>
          <div className='flex'>
            <TotalWinningsAmount className='relative rounded-full bg-white bg-opacity-20 dark:bg-actually-black dark:bg-opacity-10 px-3' />
            <FeatherIcon icon='chevron-right' className='w-6 h-6 opacity-50 my-auto ml-1' />
          </div>
        </div>
      </button>
      <TotalWinningsSheet open={isOpen} onDismiss={() => setIsOpen(false)} />
    </>
  )
}

interface TotalWinningsSheetProps {
  open: boolean
  onDismiss: () => void
}

export const TotalWinningsSheet = (props: TotalWinningsSheetProps) => {
  const { open, onDismiss } = props
  const { t } = useTranslation()
  const usersAddress = useUsersAddress()
  const { data: totalClaimedAmount } = useUsersTotalClaimedAmountGraph(usersAddress)

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
      <NumberOfPrizesDisclaimer />
    </BottomSheet>
  )
}

interface PrizesClaimedListProps {}

const PrizesClaimedList = (props: PrizesClaimedListProps) => {
  const usersAddress = useUsersAddress()
  const queryResults = useAllUsersClaimedAmountsGraph(usersAddress)
  const isFetched = queryResults.every((queryResult) => queryResult.isFetched)
  const { t } = useTranslation()

  let listItems: React.ReactNode[] = [
    <LoadingRow key={'loadingrow1'} />,
    <LoadingRow key={'loadingrow2'} />,
    <LoadingRow key={'loadingrow3'} />
  ]
  if (isFetched) {
    listItems = []
    queryResults.forEach((queryResult) => {
      const { data } = queryResult

      const items = Object.keys(data.claimedAmounts).map((drawId) => {
        const claimedAmount = data.claimedAmounts[drawId]
        const ticket = data.ticket

        return (
          <ClaimedPrizeItem
            key={`${data.chainId}-${drawId}`}
            token={ticket}
            drawId={drawId}
            chainId={data.chainId}
            claimedAmount={claimedAmount}
          />
        )
      })

      listItems = [...listItems, ...items]
    })
  }

  if (listItems.length === 0) {
    return <EmptyState />
  }

  return (
    <ul className='space-y-3 bg-actually-black bg-opacity-10 dark:bg-white dark:bg-opacity-5 p-4 rounded-lg max-h-80 overflow-y-auto'>
      <div className='grid grid-cols-2 opacity-50 font-bold'>
        <div>{t('prizeAmountString', 'Prize amount')}</div>
        <div className='text-right'>{t('draw')} #</div>
      </div>
      {listItems}
    </ul>
  )
}

const ClaimedPrizeItem = (props: {
  token: Token
  chainId: number
  drawId: string
  claimedAmount: Amount
}) => {
  const { token, chainId, drawId, claimedAmount } = props

  return (
    <li className='grid grid-cols-2'>
      <div className='flex items-center'>
        <TokenIcon className=' mr-2' chainId={chainId} address={token.address} />
        <span className='font-bold mr-1'>{claimedAmount.amountPretty}</span>
        <span className='text-xxxxs opacity-50'>{token.symbol}</span>
      </div>
      <div className='text-right'>{drawId}</div>
    </li>
  )
}

const LoadingRow = () => (
  <div className='rounded-lg bg-actually-black bg-opacity-20 dark:bg-white dark:bg-opacity-10 animate-pulse w-full h-10' />
)

const EmptyState = () => {
  const { t } = useTranslation()
  return (
    <div className='rounded-lg bg-actually-black bg-opacity-5 dark:bg-white dark:bg-opacity-5 p-4 flex flex-col text-center'>
      <span className='font-bold opacity-70'>{t('noPrizesYet', 'No prizes... Yet.')}</span>
      <span className='text-9xl'>🤞</span>
    </div>
  )
}

const NumberOfPrizesDisclaimer = () => {
  return (
    <span className='text-xxs text-center opacity-50 px-6'>
      <Trans
        i18nKey='claimedPrizesDisclaimer'
        components={{
          a: (
            <a
              className='underline text-xxs hover:opacity-100'
              href='https://dev.pooltogether.com/protocol/contracts/v4-core/DrawBuffer'
            ></a>
          )
        }}
      />
    </span>
  )
}
