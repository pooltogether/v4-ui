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

import { useUsersAddress } from 'lib/hooks/useUsersAddress'
import { CardTitle } from 'lib/components/Text/CardTitle'
import { useUsersV3Balances } from 'lib/hooks/v3/useUsersV3Balances'
import { V3Token } from 'lib/hooks/v3/useAllUsersV3Balances'
import { useIsWalletMetamask } from 'lib/hooks/useIsWalletMetamask'
import { useIsWalletOnNetwork } from 'lib/hooks/useIsWalletOnNetwork'
import { WithdrawView } from './WithdrawView'

export const V3Deposits = () => {
  const { t } = useTranslation()
  const usersAddress = useUsersAddress()
  const { data, isFetched } = useUsersV3Balances(usersAddress)

  if (!isFetched || data.totalValueUsdScaled.isZero()) return null

  return (
    <div>
      <CardTitle title={`V3 ${t('deposits')}`} secondary={`$${data.totalValueUsd.amountPretty}`} />
      <div className='bg-pt-purple-lightest dark:bg-pt-purple rounded-lg p-4'>
        <DepositsList />
      </div>
    </div>
  )
}

const DepositsList = () => {
  const usersAddress = useUsersAddress()
  const { data, isFetched } = useUsersV3Balances(usersAddress)
  if (!isFetched) {
    return <LoadingList />
  }

  return (
    <ul className='space-y-4'>
      {data.balances.map((balance) => (
        <DepositItem
          key={'deposit-balance-' + balance.address + balance.prizePool.chainId}
          {...balance}
        />
      ))}
    </ul>
  )
}

interface DepositItemsProps extends V3Token {}

const DepositItem = (props: DepositItemsProps) => {
  const { prizePool, balance, balanceUsd } = props
  const [isOpen, setIsOpen] = useState(false)
  const { t } = useTranslation()

  const chainId: number = prizePool.chainId
  const underlyingToken = prizePool.tokens.underlyingToken
  const ticket = prizePool.tokens.ticket

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
    }
  ]

  return (
    <li className='bg-white bg-opacity-20 dark:bg-actually-black dark:bg-opacity-10 rounded-lg '>
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
        <DepositBalance {...props} />
      </button>
      <BalanceBottomSheet
        banner={<DeprecatedBanner />}
        title={`V3 ${t('prizePoolTicker', { ticker: underlyingToken.symbol })}`}
        open={isOpen}
        onDismiss={() => setIsOpen(false)}
        chainId={chainId}
        externalLinks={[
          {
            id: prizePool.prizePool.address,
            label: t('viewOnV3App', 'View on V3 app'),
            href: `https://app.pooltogether.com/account`
          }
        ]}
        views={[
          {
            id: 'withdraw',
            view: () => <WithdrawView prizePool={prizePool} />,
            label: t('withdraw'),
            theme: SquareButtonTheme.teal
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
      <div className='flex justify-center'>
        <FeatherIcon icon='bell' className='w-4 h-4 mr-2 my-auto' />
        <span>{t('v3PrizePoolsAreBeingDeprecated')}</span>
      </div>
      <span className='flex justify-center'>
        {t('visitV3ToClaimRewards', 'Visit the V3 app to claim any remaining rewards.')}
      </span>
    </div>
  )
}

const UnderlyingTokenLabel = (props: { chainId: number; address: string; symbol: string }) => (
  <div className='flex'>
    <div className='flex mr-4 my-auto relative'>
      <NetworkIcon
        chainId={props.chainId}
        className='absolute'
        sizeClassName='w-4 h-4 -right-2 -top-2'
      />
      <TokenIcon chainId={props.chainId} address={props.address} />
    </div>
    <span className='font-bold xs:text-lg'>{props.symbol}</span>
  </div>
)

const DepositBalance = (props: DepositItemsProps) => {
  const { balanceUsd, prizePool } = props
  const chainId = prizePool.chainId
  const ticket = prizePool.tokens.ticket

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
