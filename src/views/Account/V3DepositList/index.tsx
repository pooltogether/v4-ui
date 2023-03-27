import { BalanceBottomSheet, ContractLink } from '@components/BalanceBottomSheet'
import { ListItem } from '@components/List/ListItem'
import { CardTitle } from '@components/Text/CardTitle'
import { V3PrizePoolBalances } from '@hooks/v3/useAllUsersV3Balances'
import { useUsersV3PrizePoolBalances } from '@hooks/v3/useUsersV3PrizePoolBalances'
import { Amount } from '@pooltogether/hooks'
import { NetworkIcon, TokenIcon, ButtonTheme } from '@pooltogether/react-components'
import {
  useUsersAddress,
  useTransaction,
  useIsWalletOnChainId
} from '@pooltogether/wallet-connection'
import { AccountList } from '@views/Account/AccountList'
import { AccountListItemTokenBalance } from '@views/Account/AccountList/AccountListItemTokenBalance'
import { PodWithdrawView } from '@views/Account/V3DepositList/PodWithdrawView'
import { BigNumber } from 'ethers'
import FeatherIcon from 'feather-icons-react'
import { useTranslation } from 'next-i18next'
import { useMemo, useState } from 'react'
import { PrizePoolWithdrawView } from './PrizePoolWithdrawView'

// TODO: Funnel isTokenPriceFetched all the way down so users aren't scared if they see $0
export const V3DepositList = () => {
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
      </div>
      <DepositsList data={data} refetch={refetchBalances} />
    </div>
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
    <AccountList>
      {data.balances.map((balances) => {
        return (
          <DepositItem
            key={'deposit-balance-' + balances.ticket.address + balances.prizePool.chainId}
            refetchBalances={refetch}
            {...balances}
          />
        )
      })}
    </AccountList>
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

  const isWalletOnProperNetwork = useIsWalletOnChainId(chainId)
  const [txId, setTxId] = useState('')
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
  const closeModal = () => setIsOpen(false)
  const views = useMemo(
    () => [
      {
        id: 'withdraw',
        view: () => (
          <PrizePoolWithdrawView
            {...props}
            prizePool={prizePool}
            closeModal={closeModal}
            setWithdrawTxId={setTxId}
            refetchBalances={refetchBalances}
          />
        ),
        label: t('withdraw'),
        theme: ButtonTheme.tealOutline
      }
    ],
    []
  )

  return (
    <>
      <ListItem
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
        right={<AccountListItemTokenBalance chainId={chainId} token={ticket} />}
      />
      <BalanceBottomSheet
        banner={<DeprecatedBanner />}
        title={`V3 ${t('prizePoolTicker', { ticker: token.symbol })}`}
        isOpen={isOpen}
        closeModal={closeModal}
        chainId={chainId}
        externalLinks={[
          {
            id: prizePool.addresses.prizePool,
            label: prizePool.url ? 'View on the community website' : t('viewOnV3App', 'View on V3 app'),
            href: prizePool.url
          }
        ]}
        views={views}
        transactionHash={tx?.response?.hash}
        prizePoolAddress={prizePool.addresses.prizePool}
        token={token}
        balance={ticket}
        balanceUsd={ticket.balanceUsd}
        contractLinks={contractLinks}
        ticket={ticket}
      />
    </>
  )
}

const PodDepositItem = (props: DepositItemsProps) => {
  const { chainId, ticket, token, prizePool, refetchBalances } = props

  const { t } = useTranslation()
  const [isOpen, setIsOpen] = useState(false)
  const [txId, setTxId] = useState('')
  const tx = useTransaction(txId)

  const isWalletOnProperNetwork = useIsWalletOnChainId(chainId)

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
  const closeModal = () => setIsOpen(false)

  const views = useMemo(
    () => [
      {
        id: 'withdraw',
        view: () => (
          <PodWithdrawView
            {...props}
            prizePool={prizePool}
            closeModal={closeModal}
            setWithdrawTxId={setTxId}
            refetchBalances={refetchBalances}
          />
        ),
        label: t('withdraw'),
        theme: ButtonTheme.tealOutline
      }
    ],
    []
  )

  return (
    <>
      <ListItem
        onClick={() => setIsOpen(true)}
        left={
          <UnderlyingTokenLabel
            isPod
            chainId={chainId}
            symbol={token.symbol}
            address={token.address}
          />
        }
        right={<AccountListItemTokenBalance chainId={chainId} token={ticket} />}
      />
      <BalanceBottomSheet
        banner={<DeprecatedBanner />}
        title={`V3 ${t('podTicker', { ticker: token.symbol })}`}
        isOpen={isOpen}
        closeModal={closeModal}
        chainId={chainId}
        externalLinks={[
          {
            id: prizePool.addresses.prizePool,
            label: prizePool.url ? 'View on the community website' : t('viewOnV3App', 'View on V3 app'),
            href: prizePool.url
          }
        ]}
        views={views}
        transactionHash={tx?.response?.hash}
        token={token}
        balance={ticket}
        balanceUsd={ticket.balanceUsd}
        contractLinks={contractLinks}
        ticket={ticket}
        prizePoolAddress={prizePool.addresses.prizePool}
      />
    </>
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
          href='https://docs.pooltogether.com/pooltogether/using-pooltogether'
          className='underline text-sm'
          target='_blank'
          rel='noreferrer'
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
    <span className='font-bold'>
      {props.isPod && `${props.symbol} Pod`}
      {props.isSponsorship && `${props.symbol} Sponsorship`}
      {!props.isPod && !props.isSponsorship && props.symbol}
    </span>
  </div>
)
