import { useState } from 'react'
import {
  BalanceBottomSheet,
  ContractLink,
  NetworkIcon,
  SquareButtonSize,
  SquareButtonTheme,
  SquareLink,
  TokenIcon
} from '@pooltogether/react-components'
import FeatherIcon from 'feather-icons-react'
import { getNetworkNiceNameByChainId } from '@pooltogether/utilities'
import { useTranslation } from 'react-i18next'
import { PrizePool } from '@pooltogether/v4-js-client'
import { useTransaction } from '@pooltogether/hooks'
import classNames from 'classnames'
import Link from 'next/link'
import { useRouter } from 'next/router'

import { UsersPrizePoolBalances } from 'lib/hooks/v4/PrizePool/useUsersPrizePoolBalances'
import { useUsersV4Balances } from 'lib/hooks/v4/PrizePool/useUsersV4Balances'
import { useUsersAddress } from 'lib/hooks/useUsersAddress'
import { useSelectedChainId } from 'lib/hooks/useSelectedChainId'
import { DelegateTicketsSection } from './DelegateTicketsSection'
import { CardTitle } from 'lib/components/Text/CardTitle'
import { WithdrawView } from './WithdrawView'
import { useIsWalletMetamask } from 'lib/hooks/useIsWalletMetamask'
import { useIsWalletOnNetwork } from 'lib/hooks/useIsWalletOnNetwork'

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
  const { data, isFetched, refetch } = useUsersV4Balances(usersAddress)
  if (!isFetched) {
    return <LoadingList />
  }
  return (
    <ul className='space-y-4'>
      {data.balances.map((balance) => (
        <DepositItem
          key={'deposit-balance-' + balance.prizePool.id()}
          {...balance}
          refetchBalances={refetch}
        />
      ))}
    </ul>
  )
}

export interface DepositItemsProps {
  balances: UsersPrizePoolBalances
  prizePool: PrizePool
  refetchBalances: () => void
}

const DepositItem = (props: DepositItemsProps) => {
  const { prizePool, balances, refetchBalances } = props

  const router = useRouter()
  const [isOpen, setIsOpen] = useState(false)
  const { setSelectedChainId } = useSelectedChainId()
  const { t } = useTranslation()
  const [txId, setTxId] = useState(0)
  const tx = useTransaction(txId)

  const chainId = prizePool.chainId
  const contractLinks: ContractLink[] = [
    {
      i18nKey: 'prizePool',
      chainId,
      address: prizePool.address
    },
    {
      i18nKey: 'token',
      chainId,
      address: balances.ticket.address
    },
    {
      i18nKey: 'depositToken',
      chainId,
      address: balances.token.address
    }
  ]
  const isWalletMetaMask = useIsWalletMetamask()
  const isWalletOnProperNetwork = useIsWalletOnNetwork(chainId)
  const onDismiss = () => setIsOpen(false)

  return (
    <li className='transition bg-white bg-opacity-70 hover:bg-opacity-100 dark:bg-actually-black dark:bg-opacity-10 dark:hover:bg-opacity-20 rounded-lg '>
      <button
        className='p-4 w-full flex justify-between items-center'
        onClick={() => {
          setSelectedChainId(chainId)
          setIsOpen(true)
        }}
      >
        <NetworkLabel chainId={chainId} />
        <DepositBalance {...props} />
      </button>
      <DelegateTicketsSection prizePool={prizePool} balance={balances?.ticket} />
      <BalanceBottomSheet
        title={t('depositsOnNetwork', { network: getNetworkNiceNameByChainId(chainId) })}
        open={isOpen}
        label={`Manage deposits for ${prizePool.id()}`}
        onDismiss={onDismiss}
        chainId={chainId}
        internalLinks={
          <Link href={{ pathname: '/deposit', query: router.query }}>
            <SquareLink
              size={SquareButtonSize.md}
              theme={SquareButtonTheme.teal}
              className='w-full'
            >
              {t('deposit')}
            </SquareLink>
          </Link>
        }
        views={[
          {
            id: 'withdraw',
            view: () => (
              <WithdrawView
                prizePool={prizePool}
                balances={balances}
                withdrawTx={tx}
                setWithdrawTxId={setTxId}
                onDismiss={onDismiss}
                refetchBalances={refetchBalances}
              />
            ),
            label: t('withdraw'),
            theme: SquareButtonTheme.tealOutline
          }
        ]}
        tx={tx}
        token={balances.ticket}
        balance={balances.ticket}
        balanceUsd={balances.ticket}
        t={t}
        contractLinks={contractLinks}
        isWalletOnProperNetwork={isWalletOnProperNetwork}
        isWalletMetaMask={isWalletMetaMask}
      />
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
