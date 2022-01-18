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
import { Amount, Token, useTransaction } from '@pooltogether/hooks'
import { BigNumber } from 'ethers'

import { useUsersAddress } from 'lib/hooks/useUsersAddress'
import { CardTitle } from 'lib/components/Text/CardTitle'
import { useUsersV3Balances } from 'lib/hooks/v3/useUsersV3Balances'
import { V3Token } from 'lib/hooks/v3/useAllUsersV3Balances'
import { useIsWalletMetamask } from 'lib/hooks/useIsWalletMetamask'
import { useIsWalletOnNetwork } from 'lib/hooks/useIsWalletOnNetwork'
import { WithdrawView } from './WithdrawView'
import { useUsersV3PodBalances } from 'lib/hooks/v3/useUsersV3PodBalances'
import { PodBalance } from 'lib/hooks/v3/useAllUsersV3PodBalances'
import { getAmountFromBigNumber } from 'lib/utils/getAmountFromBigNumber'

const LP_POOL_ADDRESS = '0x3af7072d29adde20fc7e173a7cb9e45307d2fb0a'
const POOL_POOL_ADDRESS = '0x396b4489da692788e327e2e4b2b0459a5ef26791'

export const V3Deposits = () => {
  const { t } = useTranslation()
  const usersAddress = useUsersAddress()
  const {
    data: prizePoolBalances,
    isFetched: isPrizePoolBalancesFetched,
    refetch: refetchPrizePoolBalances
  } = useUsersV3Balances(usersAddress)
  const { data: podBalances, isFetched: isPodBalancesFetched } = useUsersV3PodBalances(usersAddress)

  // Show nothing while loading
  if (!isPrizePoolBalancesFetched || !isPodBalancesFetched) return null

  const totalValueUsdScaled = prizePoolBalances.totalValueUsdScaled.add(
    podBalances.totalValueUsdScaled
  )
  const totalValueUsd = getAmountFromBigNumber(totalValueUsdScaled, '2')

  // Show nothing if the user has no v3 balances
  if (totalValueUsd.amountUnformatted.isZero()) {
    return null
  }

  return (
    <div>
      <div className='mb-2 flex items-center justify-between'>
        <CardTitle title={`V3 ${t('deposits')}`} secondary={`$${totalValueUsd.amountPretty}`} />
        <V3AppLink />
      </div>
      <div className='bg-pt-purple-lightest dark:bg-pt-purple rounded-lg p-4 space-y-4'>
        <DepositsList
          data={prizePoolBalances}
          isFetched={isPrizePoolBalancesFetched}
          refetch={refetchPrizePoolBalances}
        />
        <PodsDepositsList data={podBalances} isFetched={isPodBalancesFetched} />
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
    balances: V3Token[]
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
      POOL_POOL_ADDRESS !== balance.prizePool.prizePool.address &&
      LP_POOL_ADDRESS !== balance.prizePool.prizePool.address
  )

  if (filteredBalances.length === 0) {
    return null
  }

  return (
    <ul className='space-y-4'>
      {filteredBalances.map((balance) => {
        return (
          <DepositItem
            key={'deposit-balance-' + balance.address + balance.prizePool.chainId}
            refetchBalances={refetch}
            {...balance}
          />
        )
      })}
    </ul>
  )
}

const PodsDepositsList = (props: {
  data: {
    balances: PodBalance[]
    totalValueUsdScaled: BigNumber
    totalValueUsd: Amount
  }
  isFetched: boolean
}) => {
  const { data, isFetched } = props
  if (!isFetched) {
    return <LoadingList />
  }

  if (data.balances.length === 0) {
    return null
  }

  return (
    <ul className='space-y-4'>
      {data.balances.map((balance) => {
        return (
          <PodDepositItem
            key={'pod-deposit-balance-' + balance.address + balance.pod.prizePool.config.chainId}
            {...balance}
          />
        )
      })}
    </ul>
  )
}

export interface DepositItemsProps extends V3Token {
  refetchBalances: () => void
}

const DepositItem = (props: DepositItemsProps) => {
  const { prizePool, balance, balanceUsd, refetchBalances } = props

  const [isOpen, setIsOpen] = useState(false)
  const { t } = useTranslation()

  const chainId: number = prizePool.chainId
  const underlyingToken = prizePool.tokens.underlyingToken
  const ticket = prizePool.tokens.ticket

  const isWalletMetaMask = useIsWalletMetamask()
  const isWalletOnProperNetwork = useIsWalletOnNetwork(chainId)
  const [txId, setTxId] = useState(0)
  const tx = useTransaction(txId)

  const contractLinks: ContractLink[] = [
    {
      i18nKey: 'prizePool',
      chainId,
      address: prizePool.prizePool.address
    },
    {
      i18nKey: 'prizeStrategy',
      chainId,
      address: prizePool.prizeStrategy.address
    },
    {
      i18nKey: 'depositToken',
      chainId,
      address: prizePool.tokens.underlyingToken.address
    },
    {
      i18nKey: 'ticketToken',
      chainId,
      address: prizePool.tokens.ticket.address
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
          symbol={underlyingToken.symbol}
          address={underlyingToken.address}
        />
        <DepositBalance balanceUsd={balanceUsd} chainId={chainId} ticket={ticket} />
      </button>
      <BalanceBottomSheet
        banner={<DeprecatedBanner />}
        title={`V3 ${t('prizePoolTicker', { ticker: underlyingToken.symbol })}`}
        open={isOpen}
        onDismiss={onDismiss}
        chainId={chainId}
        externalLinks={[
          {
            id: prizePool.prizePool.address,
            label: t('viewOnV3App', 'View on V3 app'),
            href: `https://v3.pooltogether.com/account`
          }
        ]}
        views={[
          {
            id: 'withdraw',
            view: () => (
              <WithdrawView
                {...props}
                prizePool={prizePool}
                onDismiss={onDismiss}
                withdrawTx={tx}
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
        balance={balance}
        balanceUsd={balanceUsd}
        t={t}
        contractLinks={contractLinks}
        isWalletOnProperNetwork={isWalletOnProperNetwork}
        isWalletMetaMask={isWalletMetaMask}
      />
    </li>
  )
}

export interface PodDepositItemsProps extends PodBalance {}

const PodDepositItem = (props: PodDepositItemsProps) => {
  const { pod, balance, balanceUsd } = props

  const [isOpen, setIsOpen] = useState(false)
  const { t } = useTranslation()

  const prizePool = pod.prizePool
  const chainId: number = prizePool.config.chainId
  const underlyingToken = prizePool.tokens.underlyingToken
  const ticket = pod.tokens.podStablecoin

  const isWalletMetaMask = useIsWalletMetamask()
  const isWalletOnProperNetwork = useIsWalletOnNetwork(chainId)

  const contractLinks: ContractLink[] = [
    {
      i18nKey: 'prizePool',
      chainId,
      address: prizePool.prizePool.address
    },
    {
      i18nKey: 'prizeStrategy',
      chainId,
      address: prizePool.prizeStrategy.address
    },
    {
      i18nKey: 'depositToken',
      chainId,
      address: prizePool.tokens.underlyingToken.address
    },
    {
      i18nKey: 'ticketToken',
      chainId,
      address: prizePool.tokens.ticket.address
    },
    {
      i18nKey: 'podTicket',
      chainId,
      address: pod.tokens.podStablecoin.address
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
          symbol={underlyingToken.symbol}
          address={underlyingToken.address}
        />
        <DepositBalance balanceUsd={balanceUsd} chainId={chainId} ticket={ticket} />
      </button>
      <BalanceBottomSheet
        banner={<DeprecatedBanner />}
        title={`V3 ${t('podTicker', { ticker: underlyingToken.symbol })}`}
        open={isOpen}
        onDismiss={onDismiss}
        chainId={chainId}
        externalLinks={[
          {
            id: prizePool.prizePool.address,
            label: t('withdraw'),
            href: `https://v3.pooltogether.com/account`
          }
        ]}
        tx={null}
        token={ticket}
        balance={balance}
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
      {props.isPod ? `${props.symbol} Pod` : props.symbol}
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
