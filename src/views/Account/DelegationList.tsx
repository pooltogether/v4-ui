import { CardTitle } from '@components/Text/CardTitle'
import { useTotalAmountDelegatedTo } from '@hooks/v4/PrizePool/useTotalAmountDelegatedTo'
import { useAllTwabDelegations } from '@hooks/v4/TwabDelegator/useAllTwabDelegations'
import { useUsersAddress } from '@pooltogether/wallet-connection'
import { AccountList } from './AccountList'
import { BalanceDelegatedToItem } from './V4DepositList/BalanceDelegatedToItem'
import { TwabDelegatorItem } from './V4DepositList/TwabDelegatorItem'

export const DelegationList = () => {
  const usersAddress = useUsersAddress()
  const { data: delegatedToData, isFetched: isAmountDelegatedToFetched } =
    useTotalAmountDelegatedTo(usersAddress)
  const { data: delegationData, isFetched: isDelegationsFetched } =
    useAllTwabDelegations(usersAddress)

  if (
    (isDelegationsFetched && !delegationData.totalTokenWithUsdBalance.amountUnformatted.isZero()) ||
    (isAmountDelegatedToFetched && !delegatedToData.delegatedAmount.amountUnformatted.isZero())
  ) {
    return (
      <div>
        <CardTitle title='Delegations' className='mb-2' />
        <AccountList>
          <BalanceDelegatedToItem usersAddress={usersAddress} />
          <TwabDelegatorItem delegator={usersAddress} />
        </AccountList>
      </div>
    )
  }

  return null
}
