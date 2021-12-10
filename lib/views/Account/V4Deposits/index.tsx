import { NetworkIcon, TokenIcon } from '@pooltogether/react-components'
import FeatherIcon from 'feather-icons-react'
import { getNetworkNiceNameByChainId } from '@pooltogether/utilities'
import { UsersPrizePoolBalances } from 'lib/hooks/Tsunami/PrizePool/useUsersPrizePoolBalances'
import { useUsersV4Balances } from 'lib/hooks/Tsunami/PrizePool/useUsersV4Balances'
import { useUsersAddress } from 'lib/hooks/useUsersAddress'
import { useTranslation } from 'react-i18next'
import { ManageBalanceSheet } from './ManageBalanceSheet'
import { useState } from 'react'
import { PrizePool } from '@pooltogether/v4-js-client'
import { useSelectedChainId } from 'lib/hooks/useSelectedChainId'
import { DelegateTicketsSection } from './DelegateTicketsSection'

export const V4Deposits = () => {
  const { t } = useTranslation()
  return (
    <div id='deposits'>
      <h3>{t('deposits')}</h3>
      <div className='bg-pt-purple-lighter dark:bg-pt-purple rounded-lg p-4'>
        <DepositsList />
      </div>
    </div>
  )
}

const DepositsList = () => {
  const usersAddress = useUsersAddress()
  const queryResults = useUsersV4Balances(usersAddress)
  const isFetched = queryResults.every((queryResult) => queryResult.isFetched)
  if (!isFetched) {
    return <LoadingList />
  }
  return (
    <ul className='space-y-4'>
      {queryResults.map((queryResult) => (
        <DepositItem
          key={'deposit-balance-' + queryResult.data.prizePool.id()}
          {...queryResult.data}
        />
      ))}
    </ul>
  )
}

interface DepositItemsProps {
  balances: UsersPrizePoolBalances
  prizePool: PrizePool
}

const DepositItem = (props: DepositItemsProps) => {
  const { prizePool, balances } = props
  const [isOpen, setIsOpen] = useState(false)
  const { setSelectedChainId } = useSelectedChainId()

  return (
    <li className='bg-white bg-opacity-20 dark:bg-actually-black dark:bg-opacity-10 rounded-lg '>
      <button
        className='p-4 w-full flex justify-between items-center'
        onClick={() => {
          setSelectedChainId(prizePool.chainId)
          setIsOpen(true)
        }}
      >
        <NetworkLabel chainId={prizePool.chainId} />
        <DepositBalance {...props} />
      </button>
      <DelegateTicketsSection prizePool={prizePool} balance={balances?.ticket} />
      <ManageBalanceSheet {...props} open={isOpen} onDismiss={() => setIsOpen(false)} />
    </li>
  )
}

const NetworkLabel = (props: { chainId: number }) => (
  <div className='flex'>
    <NetworkIcon chainId={props.chainId} className='mr-2 my-auto' />
    <span className='font-bold xs:text-lg'>{getNetworkNiceNameByChainId(props.chainId)}</span>
  </div>
)

const DepositBalance = (props: DepositItemsProps) => {
  const { balances, prizePool } = props
  const { ticket } = balances
  return (
    <div className='flex'>
      <TokenIcon chainId={prizePool.chainId} address={ticket.address} className='mr-2 my-auto' />
      <span className='font-bold text-lg mr-3'>{ticket.amountPretty}</span>
      <FeatherIcon icon='chevron-right' className='my-auto h-8 w-8 opacity-50' />
    </div>
  )
}

const LoadingList = () => (
  <ul className='space-y-4'>
    <li className='rounded-lg bg-white bg-opacity-20 dark:bg-actually-black dark:bg-opacity-10 animate-pulse w-full h-10' />
    <li className='rounded-lg bg-white bg-opacity-20 dark:bg-actually-black dark:bg-opacity-10 animate-pulse w-full h-10' />
  </ul>
)
