import { useState } from 'react'
import { NetworkIcon, TokenIcon } from '@pooltogether/react-components'
import FeatherIcon from 'feather-icons-react'
import { getNetworkNiceNameByChainId } from '@pooltogether/utilities'
import { useTranslation } from 'react-i18next'
import { PrizePool } from '@pooltogether/v4-js-client'
import classNames from 'classnames'

import { UsersPrizePoolBalances } from 'lib/hooks/v4/PrizePool/useUsersPrizePoolBalances'
import { useUsersV4Balances } from 'lib/hooks/v4/PrizePool/useUsersV4Balances'
import { useUsersAddress } from 'lib/hooks/useUsersAddress'
import { ManageBalanceSheet } from './ManageBalanceSheet'
import { useSelectedChainId } from 'lib/hooks/useSelectedChainId'
import { DelegateTicketsSection } from './DelegateTicketsSection'
import { CardTitle } from 'lib/components/Text/CardTitle'

export const V4Deposits = () => {
  const { t } = useTranslation()
  const usersAddress = useUsersAddress()
  const { data } = useUsersV4Balances(usersAddress)

  return (
    <div id='deposits'>
      <CardTitle title={t('deposits')} secondary={`$${data?.totalValueUsd.amountPretty}`} />
      <div className='bg-pt-purple-lightest dark:bg-pt-purple rounded-lg p-4'>
        <DepositsList />
      </div>
    </div>
  )
}

const DepositsList = () => {
  const usersAddress = useUsersAddress()
  const { data, isFetched } = useUsersV4Balances(usersAddress)
  if (!isFetched) {
    return <LoadingList />
  }
  return (
    <ul className='space-y-4'>
      {data.balances.map((balance) => (
        <DepositItem key={'deposit-balance-' + balance.prizePool.id()} {...balance} />
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
      <span className={classNames('font-bold text-lg mr-3', { 'opacity-50': !ticket.hasBalance })}>
        ${ticket.amountPretty}
      </span>
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

// t('depositsOnNetwork', { network: getNetworkNiceNameByChainId(chainId) })
