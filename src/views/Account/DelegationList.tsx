import { CardTitle } from '@components/Text/CardTitle'
import { useTotalAmountDelegatedTo } from '@hooks/v4/PrizePool/useTotalAmountDelegatedTo'
import { useAllTwabDelegations } from '@hooks/v4/TwabDelegator/useAllTwabDelegations'
import { ExternalLink } from '@pooltogether/react-components'
import { useUsersAddress } from '@pooltogether/wallet-connection'
import FeatherIcon from 'feather-icons-react'
import { AccountList } from './AccountList'
import { BalanceDelegatedToItem } from './V4DepositList/BalanceDelegatedToItem'
import { TwabDelegatorItem } from './V4DepositList/TwabDelegatorItem'

export const DelegationList = () => {
  const usersAddress = useUsersAddress()
  const { data: delegatedToData, isFetched: isAmountDelegatedToFetched } =
    useTotalAmountDelegatedTo(usersAddress)
  const { data: delegationData, isFetched: isDelegationsFetched } =
    useAllTwabDelegations(usersAddress)

  return (
    <div>
      <CardTitle title='Delegations' className='mb-2' />
      <AccountList>
        <BalanceDelegatedToItem usersAddress={usersAddress} />
        <TwabDelegatorItem delegator={usersAddress} />
        {isDelegationsFetched &&
          isAmountDelegatedToFetched &&
          delegationData.totalTokenWithUsdBalance.amountUnformatted.isZero() &&
          delegatedToData.delegatedAmount.amountUnformatted.isZero() && (
            <p className='opacity-70 text-xs'>
              Delegations let you share chances to win!{' '}
              <ExternalLink href='https://tools.pooltogether.com/delegate'>
                Check it out
              </ExternalLink>
            </p>
          )}
      </AccountList>
    </div>
  )
}
