import { formatCurrencyValue } from '@components/CurrencyValue'
import { ListItem } from '@components/List/ListItem'
import { PrizePoolLabel } from '@components/PrizePool/PrizePoolLabel'
import { CardTitle } from '@components/Text/CardTitle'
import { useSelectedCurrency } from '@hooks/useSelectedCurrency'
import type { V3PrizePoolBalances } from '@hooks/v3/useAllUsersV3Balances'
import { useUsersV3PrizePoolBalances } from '@hooks/v3/useUsersV3PrizePoolBalances'
import { useAllUsersV4Balances } from '@hooks/v4/PrizePool/useAllUsersV4Balances'
import { useTotalAmountDelegatedTo } from '@hooks/v4/PrizePool/useTotalAmountDelegatedTo'
import { useAllTwabDelegations } from '@hooks/v4/TwabDelegator/useAllTwabDelegations'
import { Token, TokenWithBalance, TokenWithUsdBalance } from '@pooltogether/hooks'
import { NetworkIcon, TokenIconWithNetwork } from '@pooltogether/react-components'
import { getNetworkNiceNameByChainId } from '@pooltogether/utilities'
import { PrizePool } from '@pooltogether/v4-client-js'
import { AccountListItemTokenBalance } from '@views/Account/AccountList/AccountListItemTokenBalance'
import { LoadingList } from '@views/Account/AccountList/LoadingList'
import { BalanceDelegatedToItem } from '@views/Account/V4DepositList/BalanceDelegatedToItem'
import { TwabDelegatorItem } from '@views/Account/V4DepositList/TwabDelegatorItem'
import { useTranslation } from 'next-i18next'
import { useExchangeRates } from '../../serverAtoms'

/**
 * Displays V4 deposits.
 * @param props
 * @returns
 */
export const SimpleV4DepositList: React.FC<{ usersAddress: string }> = (props) => {
  const { usersAddress } = props
  const { data } = useAllUsersV4Balances(usersAddress)
  const exchangeRates = useExchangeRates()
  const { currency } = useSelectedCurrency()
  const { t } = useTranslation()

  return (
    <div id='deposits'>
      <CardTitle
        className='mb-2'
        title={t('deposits')}
        secondary={formatCurrencyValue(data?.totalValueUsd.amount, currency, exchangeRates)}
      />
      <V4DepositsList usersAddress={usersAddress} />
    </div>
  )
}

/**
 * Displays V3 deposits (hidden after loading if empty).
 * @param props
 * @returns
 */
export const SimpleV3DepositList: React.FC<{ usersAddress: string }> = (props) => {
  const { usersAddress } = props
  const { data, isFetched } = useUsersV3PrizePoolBalances(usersAddress, false)
  const exchangeRates = useExchangeRates()
  const { currency } = useSelectedCurrency()
  const { t } = useTranslation()

  if (!isFetched || data.balances.length === 0) return null
  return (
    <div>
      <CardTitle
        className='mb-2'
        title={`V3 ${t('deposits')}`}
        secondary={formatCurrencyValue(
          data?.totalValueUsd.amount || '0.00',
          currency,
          exchangeRates
        )}
      />
      <V3DepositsList usersAddress={usersAddress} balances={data.balances} />
    </div>
  )
}

const V4DepositsList: React.FC<{ usersAddress: string }> = (props) => {
  const { usersAddress } = props
  const { t } = useTranslation()
  const { data, isFetched } = useAllUsersV4Balances(usersAddress)

  if (!isFetched) {
    return <LoadingList />
  }

  return (
    <ul className='space-y-2'>
      {data.balances.map((balances) => (
        <V4DepositItem
          key={'deposit-balance-' + balances.prizePool.id()}
          prizePool={balances?.prizePool}
          usersAddress={usersAddress}
          token={balances.balances.ticket}
          chainId={balances.prizePool.chainId}
        />
      ))}
      {data.balances.length === 0 && (
        <div className='text-center opacity-50 text-xxs'>{t('noDeposits', 'No deposits')}</div>
      )}
      <Divider usersAddress={usersAddress} />
      <BalanceDelegatedToItem usersAddress={usersAddress} />
      <TwabDelegatorItem delegator={usersAddress} />
    </ul>
  )
}

const V3DepositsList: React.FC<{ usersAddress: string; balances: V3PrizePoolBalances[] }> = (
  props
) => {
  const { usersAddress, balances } = props

  return (
    <ul className='space-y-2'>
      {balances.map((balancesList) => (
        <V3DepositItem
          key={'v3-deposit-balance-' + balancesList.prizePool.addresses.prizePool}
          usersAddress={usersAddress}
          token={balancesList.ticket}
          chainId={balancesList.prizePool.chainId}
        />
      ))}
    </ul>
  )
}

const V4DepositItem: React.FC<{
  prizePool: PrizePool
  usersAddress: string
  token: TokenWithUsdBalance | TokenWithBalance
  chainId: number
}> = (props) => {
  const { token, prizePool, chainId } = props

  return (
    <ListItem
      left={<PrizePoolLabel prizePool={prizePool} />}
      right={<DepositBalance chainId={chainId} token={token} />}
    />
  )
}

const V3DepositItem: React.FC<{
  usersAddress: string
  token: TokenWithUsdBalance | TokenWithBalance
  chainId: number
}> = (props) => {
  const { token, chainId } = props

  return (
    <ListItem
      left={<V3PrizePoolLabel token={token} chainId={chainId} />}
      right={<DepositBalance chainId={chainId} token={token} />}
    />
  )
}

const V3PrizePoolLabel: React.FC<{ token: Token; chainId: number }> = (props) => (
  <div className='flex space-x-3'>
    <TokenIconWithNetwork chainId={props.chainId} address={props.token.address} />
    <span className='font-bold'>{props.token.symbol}</span>
  </div>
)

const DepositBalance: React.FC<{
  token: TokenWithUsdBalance | TokenWithBalance
  chainId: number
}> = (props) => {
  const { token, chainId } = props
  return <AccountListItemTokenBalance chainId={chainId} token={token} />
}

const Divider: React.FC<{ usersAddress: string }> = (props) => {
  const { usersAddress } = props
  const { data: delegatedToData, isFetched: isAmountDelegatedToFetched } =
    useTotalAmountDelegatedTo(usersAddress)
  const { data: delegationData, isFetched: isDelegationsFetched } =
    useAllTwabDelegations(usersAddress)

  if (
    (isDelegationsFetched &&
      !delegationData?.totalTokenWithUsdBalance.amountUnformatted.isZero()) ||
    (isAmountDelegatedToFetched && !delegatedToData?.delegatedAmount.amountUnformatted.isZero())
  ) {
    return (
      <li>
        <hr className='m-3' />
      </li>
    )
  }

  return null
}
