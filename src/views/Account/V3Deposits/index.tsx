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
import { Amount, Token, TokenWithUsdBalance, useTransaction } from '@pooltogether/hooks'
import { BigNumber } from 'ethers'

import { useUsersAddress } from '@src/hooks/useUsersAddress'
import { CardTitle } from '@src/components/Text/CardTitle'
import { useUsersV3PrizePoolBalances } from '@src/hooks/v3/useUsersV3PrizePoolBalances'
import { useIsWalletMetamask } from '@src/hooks/useIsWalletMetamask'
import { useIsWalletOnNetwork } from '@src/hooks/useIsWalletOnNetwork'
import { PrizePoolWithdrawView } from './PrizePoolWithdrawView'
import { V3PrizePoolBalances } from '@src/hooks/v3/useAllUsersV3Balances'
import { PodWithdrawView } from '@src/views/Account/V3Deposits/PodWithdrawView'
import { PrizePoolDepositList } from '@src/components/PrizePoolDepositList'
import { PrizePoolDepositListItem } from '@src/components/PrizePoolDepositList/PrizePoolDepositListItem'
import { PrizePoolDepositBalance } from '@src/components/PrizePoolDepositList/PrizePoolDepositBalance'

// TODO: Funnel isTokenPriceFetched all the way down so users aren't scared if they see $0
export const V3Deposits = () => {
  const { t } = useTranslation()
  const usersAddress = useUsersAddress()
  const {
    data,
    isFetched: isBalancesFetched,
    refetch: refetchBalances
  } = useUsersV3PrizePoolBalances(usersAddress)

  // Show nothing while loading
  if (!isBalancesFetched) return null

  // Show nothing if the user has no v3 balances
  if (data.balances.length === 0) {
    return null
  }

  return (
    <div>
      <div className='mb-2 flex items-center justify-between'>
        <CardTitle
          title={`V3 ${t('deposits')}`}
          secondary={`$${data.totalValueUsd.amountPretty}`}
        />
        <V3AppLink />
      </div>
      <DepositsList data={data} refetch={refetchBalances} />
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
    balances: V3PrizePoolBalances[]
    totalValueUsdScaled: BigNumber
    totalValueUsd: Amount
  }
  refetch: () => void
}) => {
  const { data, refetch } = props

  return (
    <PrizePoolDepositList>
      {data.balances.map((balances) => {
        return (
          <DepositItem
            key={'deposit-balance-' + balances.ticket.address + balances.prizePool.chainId}
            refetchBalances={refetch}
            {...balances}
          />
        )
      })}
    </PrizePoolDepositList>
  )
}

export interface DepositItemsProps extends V3PrizePoolBalances {
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
  const { prizePool, chainId, token, ticket, refetchBalances, isSponsorship } = props

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
    <>
      <PrizePoolDepositListItem
        onClick={() => {
          setIsOpen(true)
        }}
        left={
          <UnderlyingTokenLabel
            chainId={chainId}
            symbol={token.symbol}
            address={token.address}
            isSponsorship={isSponsorship}
          />
        }
        right={<DepositBalance chainId={chainId} ticket={ticket} />}
      />
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
        balanceUsd={ticket.balanceUsd}
        t={t}
        contractLinks={contractLinks}
        isWalletOnProperNetwork={isWalletOnProperNetwork}
        isWalletMetaMask={isWalletMetaMask}
      />
    </>
  )
}

const PodDepositItem = (props: DepositItemsProps) => {
  const { chainId, ticket, token, prizePool, refetchBalances } = props

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
        <DepositBalance chainId={chainId} ticket={ticket} />
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
        balanceUsd={ticket.balanceUsd}
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
  chainId: number
  ticket: TokenWithUsdBalance
}

const DepositBalance = (props: DepositBalanceProps) => {
  const { chainId, ticket } = props
  return <PrizePoolDepositBalance chainId={chainId} token={ticket} />
}
