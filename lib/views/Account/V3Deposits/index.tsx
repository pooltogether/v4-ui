import {
  BalanceBottomSheet,
  ContractLink,
  NetworkIcon,
  SquareButtonTheme,
  TokenIcon
} from '@pooltogether/react-components'
import FeatherIcon from 'feather-icons-react'
import { useTranslation } from 'react-i18next'
import { useState } from 'react'
import classNames from 'classnames'
import { Amount, Token, TokenWithBalance, useTransaction } from '@pooltogether/hooks'
import { BigNumber } from 'ethers'

import { useUsersAddress } from 'lib/hooks/useUsersAddress'
import { CardTitle } from 'lib/components/Text/CardTitle'
import { useUsersV3Balances } from 'lib/hooks/v3/useUsersV3Balances'
import { useIsWalletMetamask } from 'lib/hooks/useIsWalletMetamask'
import { useIsWalletOnNetwork } from 'lib/hooks/useIsWalletOnNetwork'
import { PrizePoolWithdrawView } from './PrizePoolWithdrawView'
import { V3PrizePool } from 'lib/hooks/v3/useV3PrizePools'
import { V3TokenBalance } from 'lib/hooks/v3/useAllUsersV3Balances'
import { PodWithdrawView } from 'lib/views/Account/V3Deposits/PodWithdrawView'

const LP_POOL_ADDRESS = '0x3af7072d29adde20fc7e173a7cb9e45307d2fb0a'
const POOL_POOL_ADDRESS = '0x396b4489da692788e327e2e4b2b0459a5ef26791'

export const V3Deposits = () => {
  const { t } = useTranslation()
  const usersAddress = useUsersAddress()
  const {
    data: balances,
    isFetched: isBalancesFetched,
    refetch: refetchBalances
  } = useUsersV3Balances(usersAddress)

  // Show nothing while loading
  if (!isBalancesFetched) return null

  // Show nothing if the user has no v3 balances
  if (balances.totalValueUsd.amountUnformatted.isZero()) {
    return null
  }

  return (
    <div>
      <div className='mb-2 flex items-center justify-between'>
        <CardTitle
          title={`V3 ${t('deposits')}`}
          secondary={`$${balances.totalValueUsd.amountPretty}`}
        />
        <V3AppLink />
      </div>
      <div className='bg-pt-purple-lightest dark:bg-pt-purple rounded-lg p-4 space-y-4'>
        <DepositsList data={balances} isFetched={isBalancesFetched} refetch={refetchBalances} />
      </div>
    </div>
  )
}

const V3AppLink = () => {
  const { t } = useTranslation()
  return (
    <a
      className='opacity-50 hover:opacity-100 flex items-center transition-opacity'
      href='https://v3.pooltogether.com'
    >
      {t('v3App', 'V3 App')}
      <FeatherIcon icon='external-link' className='w-4 h-4 ml-1' />
    </a>
  )
}

const DepositsList = (props: {
  data: {
    balances: V3TokenBalance[]
    totalValueUsdScaled: BigNumber
    totalValueUsd: Amount
  }
  isFetched: boolean
  refetch: () => void
}) => {
  const { data, isFetched, refetch } = props
  if (!isFetched) {
    return <LoadingList />
  }

  const filteredBalances = data.balances.filter(
    (balance) =>
      POOL_POOL_ADDRESS !== balance.prizePool.addresses.prizePool &&
      LP_POOL_ADDRESS !== balance.prizePool.addresses.prizePool
  )

  if (filteredBalances.length === 0) {
    return null
  }

  return (
    <ul className='space-y-4'>
      {filteredBalances.map((balance) => {
        return (
          <DepositItem
            key={'deposit-balance-' + balance.ticket.address + balance.prizePool.chainId}
            refetchBalances={refetch}
            {...balance}
          />
        )
      })}
    </ul>
  )
}

export interface DepositItemsProps extends V3TokenBalance {
  chainId: number
  token: TokenWithBalance
  ticket: TokenWithBalance
  prizePool: V3PrizePool
  balanceUsd: Amount
  balanceUsdScaled: BigNumber
  refetchBalances: () => void
}

const DepositItem = (props: DepositItemsProps) => {
  const { isPod } = props

  if (isPod) {
    return <PodDepositItem {...props} />
  }

  return <PrizePoolDepositItem {...props} />
}

const PrizePoolDepositItem = (props: DepositItemsProps) => {
  const { prizePool, chainId, token, ticket, balanceUsd, refetchBalances, isSponsorship } = props

  const [isOpen, setIsOpen] = useState(false)
  const { t } = useTranslation()

  const isWalletMetaMask = useIsWalletMetamask()
  const isWalletOnProperNetwork = useIsWalletOnNetwork(chainId)
  const [txId, setTxId] = useState(0)
  const tx = useTransaction(txId)

  const contractLinks: ContractLink[] = [
    {
      i18nKey: 'prizePool',
      chainId,
      address: prizePool.addresses.prizePool
    },
    {
      i18nKey: 'prizeStrategy',
      chainId,
      address: prizePool.addresses.prizeStrategy
    },
    {
      i18nKey: 'depositToken',
      chainId,
      address: prizePool.addresses.token
    },
    {
      i18nKey: 'ticketToken',
      chainId,
      address: prizePool.addresses.ticket
    },
    {
      i18nKey: 'sponsorshipToken',
      chainId,
      address: prizePool.addresses.sponsorship
    }
  ]
  const onDismiss = () => setIsOpen(false)

  return (
    <li className='transition bg-white bg-opacity-70 hover:bg-opacity-100 dark:bg-actually-black dark:bg-opacity-10 dark:hover:bg-opacity-20 rounded-lg '>
      <button
        className='p-4 w-full flex justify-between items-center'
        onClick={() => {
          setIsOpen(true)
        }}
      >
        <UnderlyingTokenLabel
          chainId={chainId}
          symbol={token.symbol}
          address={token.address}
          isSponsorship={isSponsorship}
        />
        <DepositBalance balanceUsd={balanceUsd} chainId={chainId} ticket={ticket} />
      </button>
      <BalanceBottomSheet
        banner={<DeprecatedBanner />}
        title={`V3 ${t('prizePoolTicker', { ticker: token.symbol })}`}
        open={isOpen}
        onDismiss={onDismiss}
        chainId={chainId}
        externalLinks={[
          {
            id: prizePool.addresses.prizePool,
            label: t('viewOnV3App', 'View on V3 app'),
            href: `https://v3.pooltogether.com/account`
          }
        ]}
        views={[
          {
            id: 'withdraw',
            view: () => (
              <PrizePoolWithdrawView
                {...props}
                prizePool={prizePool}
                onDismiss={onDismiss}
                setWithdrawTxId={setTxId}
                refetchBalances={refetchBalances}
              />
            ),
            label: t('withdraw'),
            theme: SquareButtonTheme.tealOutline
          }
        ]}
        tx={tx}
        token={ticket}
        balance={ticket}
        balanceUsd={balanceUsd}
        t={t}
        contractLinks={contractLinks}
        isWalletOnProperNetwork={isWalletOnProperNetwork}
        isWalletMetaMask={isWalletMetaMask}
      />
    </li>
  )
}

const PodDepositItem = (props: DepositItemsProps) => {
  const { chainId, ticket, token, prizePool, balanceUsd, refetchBalances } = props

  const { t } = useTranslation()
  const [isOpen, setIsOpen] = useState(false)
  const [txId, setTxId] = useState(0)
  const tx = useTransaction(txId)

  const isWalletMetaMask = useIsWalletMetamask()
  const isWalletOnProperNetwork = useIsWalletOnNetwork(chainId)

  const contractLinks: ContractLink[] = [
    {
      i18nKey: 'pod',
      chainId,
      address: prizePool.addresses.pod
    },
    {
      i18nKey: 'prizePool',
      chainId,
      address: prizePool.addresses.prizePool
    },
    {
      i18nKey: 'prizeStrategy',
      chainId,
      address: prizePool.addresses.prizeStrategy
    },
    {
      i18nKey: 'depositToken',
      chainId,
      address: prizePool.addresses.token
    }
  ]
  const onDismiss = () => setIsOpen(false)

  return (
    <li className='transition bg-white bg-opacity-70 hover:bg-opacity-100 dark:bg-actually-black dark:bg-opacity-10 dark:hover:bg-opacity-20 rounded-lg '>
      <button
        className='p-4 w-full flex justify-between items-center'
        onClick={() => {
          setIsOpen(true)
        }}
      >
        <UnderlyingTokenLabel
          isPod
          chainId={chainId}
          symbol={token.symbol}
          address={token.address}
        />
        <DepositBalance balanceUsd={balanceUsd} chainId={chainId} ticket={ticket} />
      </button>
      <BalanceBottomSheet
        banner={<DeprecatedBanner />}
        title={`V3 ${t('podTicker', { ticker: token.symbol })}`}
        open={isOpen}
        onDismiss={onDismiss}
        chainId={chainId}
        externalLinks={[
          {
            id: prizePool.addresses.prizePool,
            label: t('viewOnV3App', 'View on V3 app'),
            href: `https://v3.pooltogether.com/account`
          }
        ]}
        views={[
          {
            id: 'withdraw',
            view: () => (
              <PodWithdrawView
                {...props}
                prizePool={prizePool}
                onDismiss={onDismiss}
                setWithdrawTxId={setTxId}
                refetchBalances={refetchBalances}
              />
            ),
            label: t('withdraw'),
            theme: SquareButtonTheme.tealOutline
          }
        ]}
        tx={tx}
        token={ticket}
        balance={ticket}
        balanceUsd={balanceUsd}
        t={t}
        contractLinks={contractLinks}
        isWalletOnProperNetwork={isWalletOnProperNetwork}
        isWalletMetaMask={isWalletMetaMask}
      />
    </li>
  )
}

const DeprecatedBanner = () => {
  const { t } = useTranslation()
  return (
    <div className=' bg-gradient-yellow bg-opacity-50 dark:bg-opacity-100 dark:text-actually-black p-4 rounded w-full mb-4'>
      <div className='flex flex-col items-center justify-center text-sm'>
        <FeatherIcon icon='bell' className='w-4 h-4 mr-2' />
        <span>{t('v3PrizePoolsAreBeingDeprecated')}</span>
        <a
          href='https://docs.pooltogether.com/faq/v3-to-v4-differences'
          className='underline text-sm'
          target='_blank'
        >
          {t('readMoreHere', 'read more here')}
          <FeatherIcon icon='external-link' className='inline-block w-4 h-4 ml-1' />
        </a>
      </div>
    </div>
  )
}

const UnderlyingTokenLabel = (props: {
  chainId: number
  address: string
  symbol: string
  isPod?: boolean
  isSponsorship?: boolean
}) => (
  <div className='flex'>
    <div className='flex mr-4 my-auto relative'>
      <NetworkIcon
        chainId={props.chainId}
        className='absolute'
        sizeClassName='w-4 h-4 -right-2 -top-2'
      />
      <TokenIcon chainId={props.chainId} address={props.address} />
    </div>
    <span className='font-bold xs:text-lg'>
      {props.isPod && `${props.symbol} Pod`}
      {props.isSponsorship && `${props.symbol} Sponsorship`}
      {!props.isPod && !props.isSponsorship && props.symbol}
    </span>
  </div>
)

interface DepositBalanceProps {
  balanceUsd: Amount
  chainId: number
  ticket: Token
}

const DepositBalance = (props: DepositBalanceProps) => {
  const { balanceUsd, chainId, ticket } = props

  return (
    <div className='flex'>
      <TokenIcon chainId={chainId} address={ticket.address} className='mr-2 my-auto' />
      <span
        className={classNames('font-bold text-lg mr-3', {
          'opacity-50': balanceUsd.amountUnformatted.isZero()
        })}
      >
        ${balanceUsd.amountPretty}
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
