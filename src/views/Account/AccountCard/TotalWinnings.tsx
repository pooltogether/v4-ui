import { useAllUsersClaimedAmountsGraph } from '@hooks/v4/PrizeDistributor/useAllUsersClaimedAmountsGraph'
import { useUsersTotalClaimedAmountGraph } from '@hooks/v4/PrizeDistributor/useUsersTotalClaimedAmountGraph'
import { Amount, Token } from '@pooltogether/hooks'
import { ThemedClipSpinner, TokenIcon, CountUp, BottomSheet } from '@pooltogether/react-components'
import classNames from 'classnames'
import FeatherIcon from 'feather-icons-react'
import { Trans, useTranslation } from 'next-i18next'
import React, { useMemo, useState } from 'react'

export const TotalWinningsAmount: React.FC<{ usersAddress: string; className?: string }> = (
  props
) => {
  const { usersAddress, className } = props
  const { data, isFetched, isError } = useUsersTotalClaimedAmountGraph(usersAddress)

  return (
    <span
      className={classNames(className, {
        'opacity-80': isFetched && !isError && data.totalClaimedAmount.amountUnformatted.isZero()
      })}
    >
      {!isFetched ? (
        <ThemedClipSpinner sizeClassName='w-3 h-3' className='mx-auto' />
      ) : (
        <>
          $<CountUp countTo={isFetched ? Number(data?.totalClaimedAmount.amount) : 0} />
        </>
      )}
    </span>
  )
}

export const TotalWinningsCard: React.FC<{ usersAddress: string; className?: string }> = (
  props
) => {
  const { usersAddress, className } = props
  const [isOpen, setIsOpen] = useState(false)
  const { t } = useTranslation()

  return (
    <>
      <button
        onClick={() => setIsOpen(true)}
        className={classNames(
          className,
          'p-4 bg-white dark:bg-actually-black dark:bg-opacity-10 hover:bg-white rounded-lg font-bold text-inverse'
        )}
      >
        <div className='flex justify-between w-full'>
          <span>
            <span className='mr-1'>{'🎉 '}</span>
            {t('claimedWinningsExclamation', 'Claimed winnings!')}
          </span>
          <div className='flex'>
            <TotalWinningsAmount usersAddress={usersAddress} />
            <FeatherIcon icon='chevron-right' className='w-6 h-6 opacity-50 my-auto ml-1' />
          </div>
        </div>
      </button>
      <TotalWinningsSheet
        usersAddress={usersAddress}
        isOpen={isOpen}
        closeModal={() => setIsOpen(false)}
      />
    </>
  )
}

interface TotalWinningsSheetProps {
  usersAddress: string
  isOpen: boolean
  closeModal: () => void
}

export const TotalWinningsSheet = (props: TotalWinningsSheetProps) => {
  const { isOpen, closeModal, usersAddress } = props
  const { t } = useTranslation()
  const { data } = useUsersTotalClaimedAmountGraph(usersAddress)

  return (
    <BottomSheet isOpen={isOpen} closeModal={closeModal} className='flex flex-col space-y-8'>
      <div className='flex items-center mx-auto'>
        <img src={'/trophy.svg'} className='mr-2' style={{ width: '38px' }} />
        <div className='flex flex-col leading-none'>
          <span className='font-bold text-xl mb-1'>
            ${data?.totalClaimedAmount?.amountPretty || '--'}
          </span>
          <span className='opacity-80 font-semibold text-xxs'>{t('totalWinnings')}</span>
        </div>
      </div>
      <PrizesClaimedList usersAddress={usersAddress} />
    </BottomSheet>
  )
}

const PrizesClaimedList = (props: { usersAddress: string }) => {
  const { usersAddress } = props
  const queryResults = useAllUsersClaimedAmountsGraph(usersAddress)
  const isFetched = queryResults.every((queryResult) => queryResult.isFetched)
  const { t } = useTranslation()

  const listItems: React.ReactNode[] = useMemo(() => {
    let listItems = [
      <LoadingRow key={'loadingrow1'} />,
      <LoadingRow key={'loadingrow2'} />,
      <LoadingRow key={'loadingrow3'} />
    ]
    if (isFetched) {
      let itemData = queryResults
        .flatMap((queryResult) => {
          const { data } = queryResult

          return Object.keys(data.claimedAmounts).map((drawId) => {
            const claimedAmount = data.claimedAmounts[drawId]
            const ticket = data.ticket

            return {
              data,
              ticket,
              drawId,
              claimedAmount
            }
          })
        })
        .sort((a, b) => Number(b.drawId) - Number(a.drawId))
      return itemData.map(({ data, ticket, drawId, claimedAmount }) => (
        <ClaimedPrizeItem
          key={`${data.chainId}-${drawId}`}
          token={ticket}
          drawId={drawId}
          chainId={data.chainId}
          claimedAmount={claimedAmount}
        />
      ))
    }
    return listItems
  }, [])

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
        <span className='text-xxxs opacity-50'>{token.symbol}</span>
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
