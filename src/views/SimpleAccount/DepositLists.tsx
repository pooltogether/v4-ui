import { ListItem } from '@components/List/ListItem'
import { PrizePoolLabel } from '@components/PrizePool/PrizePoolLabel'
import { CardTitle } from '@components/Text/CardTitle'
import type { V3PrizePoolBalances } from '@hooks/v3/useAllUsersV3Balances'
import { useUsersV3PrizePoolBalances } from '@hooks/v3/useUsersV3PrizePoolBalances'
import { useAllUsersV4Balances } from '@hooks/v4/PrizePool/useAllUsersV4Balances'
import { useTotalAmountDelegatedTo } from '@hooks/v4/PrizePool/useTotalAmountDelegatedTo'
import { useAllTwabDelegations } from '@hooks/v4/TwabDelegator/useAllTwabDelegations'
import { TokenWithBalance, TokenWithUsdBalance } from '@pooltogether/hooks'
import { NetworkIcon } from '@pooltogether/react-components'
import { getNetworkNiceNameByChainId } from '@pooltogether/utilities'
import { PrizePool } from '@pooltogether/v4-client-js'
import { AccountListItemTokenBalance } from '@views/Account/AccountList/AccountListItemTokenBalance'
import { LoadingList } from '@views/Account/AccountList/LoadingList'
import { BalanceDelegatedToItem } from '@views/Account/V4DepositList/BalanceDelegatedToItem'
import { TwabDelegatorItem } from '@views/Account/V4DepositList/TwabDelegatorItem'
import { useTranslation } from 'next-i18next'

/**
 * Displays V4 deposits.
 * @param props
 * @returns
 */
export const SimpleV4DepositList: React.FC<{ usersAddress: string }> = (props) => {
  const { usersAddress } = props
  const { data } = useAllUsersV4Balances(usersAddress)
  const { t } = useTranslation()
  return (
    <div id='deposits'>
      <CardTitle
        className='mb-2'
        title={t('deposits')}
        secondary={`$${data?.totalValueUsd.amountPretty}`}
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
  const { data, isFetched } = useUsersV3PrizePoolBalances(usersAddress)
  const { t } = useTranslation()
  if(!isFetched || data.balances.length > 0) {
    return (
      <div>
        <CardTitle
          className='mb-2'
          title={`V3 ${t('deposits')}`}
          secondary={`$${data?.totalValueUsd.amountPretty || '0.00'}`}
        />
        {isFetched ? <V3DepositsList usersAddress={usersAddress} balances={data.balances} /> : <LoadingList />}
      </div>
    )
  }
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

const V3DepositsList: React.FC<{ usersAddress: string, balances: V3PrizePoolBalances[] }> = (props) => {
  const { usersAddress, balances } = props

  return (
    <ul className='space-y-2'>
      {balances.map(balance => (
        <V3DepositItem
          key={'v3-deposit-balance-' + balance.prizePool.addresses.prizePool}
          usersAddress={usersAddress}
          token={balance.ticket}
          chainId={balance.prizePool.chainId}
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
      left={<NetworkLabel chainId={chainId} />}
      right={<DepositBalance chainId={chainId} token={token} />}
    />
  )
}

const NetworkLabel: React.FC<{ chainId: number }> = (props) => (
  <div className='flex'>
    <NetworkIcon chainId={props.chainId} className='mr-2 my-auto' />
    <span className='font-bold'>{getNetworkNiceNameByChainId(props.chainId)}</span>
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
