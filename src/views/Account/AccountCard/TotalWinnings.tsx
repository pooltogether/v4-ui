import FeatherIcon from 'feather-icons-react'
import React, { useState } from 'react'
import classNames from 'classnames'
import { useTranslation } from 'react-i18next'
import { ThemedClipSpinner, TokenIcon, BottomSheet } from '@pooltogether/react-components'
import { Amount, Token } from '@pooltogether/hooks'
import { Draw } from '@pooltogether/v4-client-js'
import { useUsersAddress } from '@pooltogether/wallet-connection'

import { useUsersTotalClaimedAmountGraph } from '@hooks/v4/PrizeDistributor/useUsersTotalClaimedAmountGraph'
import { useAllUsersClaimedAmountsGraph } from '@hooks/v4/PrizeDistributor/useAllUsersClaimedAmountsGraph'
import { getTimestampString } from '@utils/getTimestampString'

export const TotalWinnings: React.FC<{ usersAddress: string }> = (props) => {
  const { usersAddress } = props
  const [isOpen, setIsOpen] = useState(false)
  const { data: totalClaimedAmount, isFetched } = useUsersTotalClaimedAmountGraph(usersAddress)
  const { t } = useTranslation()

  return (
    <>
      <button
        onClick={() => setIsOpen(true)}
        className='p-4 bg-white bg-opacity-20 dark:bg-actually-black dark:bg-opacity-10 hover:bg-white dark:hover:bg-white dark:hover:bg-opacity-10 rounded-lg flex justify-between font-bold text-inverse transition'
      >
        <span>
          <span className='mr-1'>{'🎉 '}</span>
          {t('totalClaimedWinningsExclamation', 'Total claimed winnings!')}
        </span>
        <div className='flex'>
          <span className='relative rounded-full bg-white bg-opacity-20 dark:bg-actually-black dark:bg-opacity-10 px-3'>
            {!isFetched ? (
              <ThemedClipSpinner sizeClassName='w-3 h-3' className='mx-auto' />
            ) : (
              <>${totalClaimedAmount.amountPretty}</>
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
        <div className='mr-2' style={{ width: '38px' }}>
          <TrophyIconSvg />
        </div>
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
  const { t } = useTranslation()

  const usersAddress = useUsersAddress()
  const queryResults = useAllUsersClaimedAmountsGraph(usersAddress)
  const isFetched = queryResults.every((queryResult) => queryResult.isFetched)

  let listItems = [
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

  const ListSimple = () => (
    <ul className='space-y-3 bg-actually-black bg-opacity-10 dark:bg-white dark:bg-opacity-5 p-4 rounded-lg max-h-80 overflow-y-auto'>
      <div className='grid grid-cols-2 opacity-50 font-bold'>
        <div>{t('prizeAmountString', 'Prize amount')}</div>
        <div className='text-right'>{t('draw')} #</div>
      </div>
      {listItems}
    </ul>
  )

  // const ListWithDate = () => (
  //   <ul className='space-y-3 bg-actually-black bg-opacity-10 dark:bg-white dark:bg-opacity-5 p-4 rounded-lg max-h-80 overflow-y-auto'>
  //     <div className='grid grid-cols-2 xs:grid-cols-4 opacity-50 font-bold'>
  //       <div className='xs:col-span-2'>{t('prizeAmountString', 'Prize amount')}</div>
  //       <div className='text-right'>{t('draw')}</div>
  //       <div className='text-right'>{t('date', 'Date')}</div>
  //     </div>
  //     {listItems}
  //   </ul>
  // )

  return <ListSimple />
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

const ClaimedPrizeItemWithDate = (props: {
  token: Token
  prizeDistributorId: string
  chainId: number
  drawId: number
  claimedAmount: Amount
  draw: Draw
}) => {
  const { token, chainId, drawId, claimedAmount, draw } = props

  return (
    <li className='grid grid-cols-3 xs:grid-cols-4'>
      <div className='flex items-center xs:col-span-2'>
        <TokenIcon className=' mr-2' chainId={chainId} address={token.address} />
        <span className='font-bold mr-1'>{claimedAmount.amountPretty}</span>
        <span className='text-xxxxs opacity-50'>{token.symbol}</span>
      </div>
      <div className='text-right'>#{drawId}</div>
      <div className='text-right'>
        {getTimestampString(draw.beaconPeriodStartedAt.toNumber() + draw.beaconPeriodSeconds, {
          month: 'short',
          day: 'numeric',
          year: 'numeric'
        })}
      </div>
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

export const TrophyIconSvg = (props) => {
  return (
    <svg
      {...props}
      className={classNames(props.className, 'fill-current')}
      width='100%'
      viewBox='0 0 182 230'
      fill='none'
      xmlns='http://www.w3.org/2000/svg'
    >
      <g clipPath='url(#clip0)'>
        <path
          fillRule='evenodd'
          clipRule='evenodd'
          d='M30.3339 15.8871C29.8869 11.7722 32.0591 11.3205 33.2011 11.6089C33.2011 11.6089 52.0917 19.6333 89.8159 20.2918C127.54 20.9503 148.301 11.8902 148.301 11.8902C149.444 11.6073 151.614 12.0697 151.147 16.1823C150.68 20.2948 149.965 32.1772 149.666 37.6043L171.377 37.6573C174.044 37.5686 178.973 39.1043 177.356 45.9565C177.027 47.3505 176.545 49.7352 175.925 52.7968C172.738 68.5477 165.925 102.213 157.771 111.043C152.041 117.885 144.32 121.294 138.317 122.708C133.317 124.194 128.102 123.933 126.299 123.842L126.299 123.842C126.04 123.829 125.852 123.82 125.745 123.82C121.731 129.809 111.472 142.754 102.549 146.617C99.6405 147.667 99.6637 148.724 99.682 149.554C99.6835 149.622 99.685 149.688 99.6848 149.752C100.142 157.467 102.081 174.726 106.176 182.05C106.72 183.143 106.872 183.974 106.977 184.545C107.092 185.168 107.149 185.48 107.596 185.481L113.024 185.494C113.596 185.496 114.967 185.499 115.878 186.644C116.365 187.256 117.22 187.242 118.149 187.227C119.393 187.207 120.773 187.184 121.587 188.658C122.458 190.235 122.277 191.92 122.184 192.789C122.163 192.978 122.147 193.128 122.147 193.23L130.717 193.251C131.765 193.253 133.858 193.773 133.853 195.83L133.811 212.97C133.811 213.282 133.788 213.538 133.77 213.746C133.688 214.684 133.688 214.684 136.093 214.69L143.52 214.708C143.997 214.709 144.948 214.768 144.942 217.282L144.923 224.996C144.922 225.567 144.919 226.71 142.348 226.703L38.104 226.449C35.5329 226.442 35.5357 225.3 35.5371 224.728L35.556 217.015C35.5621 214.501 36.5138 214.446 36.9906 214.447L44.4181 214.466C46.8229 214.472 46.8229 214.472 46.7453 213.534L46.7453 213.534L46.7453 213.533C46.728 213.325 46.7069 213.069 46.7077 212.757L46.7496 195.617C46.7546 193.56 48.8508 193.051 49.8983 193.053L58.4685 193.074C58.4687 192.972 58.4533 192.822 58.4339 192.633C58.3448 191.764 58.1718 190.078 59.051 188.505C59.8722 187.035 61.2513 187.065 62.4955 187.091C63.425 187.111 64.2792 187.129 64.7693 186.519C65.6863 185.379 67.0575 185.382 67.6289 185.383L73.0567 185.397C73.5042 185.398 73.563 185.086 73.6805 184.463C73.7881 183.893 73.9448 183.063 74.4934 181.972C78.6249 174.669 80.6478 157.419 81.1427 149.707C81.1429 149.643 81.1447 149.577 81.1465 149.51L81.1465 149.509C81.1688 148.678 81.1973 147.622 78.2937 146.558C69.3902 142.651 59.1948 129.656 55.21 123.647C55.1031 123.647 54.9161 123.656 54.6595 123.667L54.6581 123.667L54.6554 123.667L54.6552 123.667C52.8517 123.749 47.6361 123.985 42.6432 122.474C36.6475 121.031 28.9427 117.584 23.246 110.714C15.1355 101.844 8.48736 68.1462 5.37695 52.38C4.77236 49.3155 4.30143 46.9284 3.9794 45.5329C2.39638 38.6728 7.33272 37.1613 9.99878 37.263L31.7099 37.3161C31.4375 31.8876 30.7809 20.0019 30.3339 15.8871ZM15.8476 46.8138C12.5076 46.7555 13.3007 50.6603 13.9042 53.6313C13.9825 54.0169 14.0576 54.3867 14.1201 54.7302C14.6639 57.7197 17.1903 70.0411 23.8372 89.8645C30.484 109.688 43.3322 111.131 48.9255 109.374C45.0967 101.096 37.0168 74.5989 35.3888 65.4319C33.7607 56.2649 31.7356 47.0911 29.3524 47.0495L15.8476 46.8138ZM167.242 54.8108C167.897 51.8509 168.758 47.9604 165.418 47.9605L151.911 47.9604C149.528 47.9604 147.343 57.0975 145.555 66.2347C143.767 75.3718 135.226 101.724 131.253 109.934C136.815 111.788 149.686 110.57 156.678 90.8651C163.67 71.1608 166.411 58.8853 167.007 55.9058C167.076 55.5635 167.157 55.1951 167.242 54.8109L167.242 54.8108ZM109.937 85.5318L90.4634 97.7875L71.0746 85.3978L90.4062 113.585L90.4062 113.593L90.4089 113.589L90.4117 113.593L90.4117 113.585L109.937 85.5318ZM90.6544 44.0403L90.6544 44.0221L90.6491 44.0311L90.644 44.0222L90.6439 44.04L70.9767 77.6478L90.4858 89.882L90.4857 89.8887L90.4911 89.8854L90.4962 89.8885L90.4962 89.8822L110.089 77.783L90.6544 44.0403Z'
          fill='#FFB636'
        />
        <path
          d='M150.342 12.4879C150.294 17.9728 123.755 22.1879 91.0653 21.9026C58.3754 21.6173 31.1194 16.9258 31.1673 11.4409C31.2152 5.95604 58.5488 1.7548 91.2387 2.04008C123.929 2.32536 150.39 7.003 150.342 12.4879Z'
          fill='#FFD469'
        />
        <path
          d='M133.184 32.0403C136.105 32.0403 136.626 32.0403 141.923 30.1866C141.266 33.7108 137.812 60.4198 136.626 64.6116C133.458 75.8124 129.879 93.1219 125.24 96.4672C124.358 97.1028 120.473 96.4672 119.027 95.5356C117.581 94.6039 122.592 85.0017 128.682 64.6116C132.125 42.6325 131.066 33.0996 133.184 32.0403Z'
          fill='#FFCC4E'
        />
      </g>
      <defs>
        <clipPath id='clip0'>
          <rect width='181.131' height='229.4' fill='white' />
        </clipPath>
      </defs>
    </svg>
  )
}
