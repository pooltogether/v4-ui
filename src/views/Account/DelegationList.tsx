import { CardTitle } from '@components/Text/CardTitle'
import { useTotalAmountDelegatedTo } from '@hooks/v4/PrizePool/useTotalAmountDelegatedTo'
import { useAllTwabDelegations } from '@hooks/v4/TwabDelegator/useAllTwabDelegations'
import { ExternalLink } from '@pooltogether/react-components'
import { useUsersAddress } from '@pooltogether/wallet-connection'
import { Trans, useTranslation } from 'next-i18next'
import { AccountList } from './AccountList'
import { BalanceDelegatedToItem } from './V4DepositList/BalanceDelegatedToItem'
import { TwabDelegatorItem } from './V4DepositList/TwabDelegatorItem'

export const DelegationList = () => {
  const usersAddress = useUsersAddress()
  const { data: delegatedToData, isFetched: isAmountDelegatedToFetched } =
    useTotalAmountDelegatedTo(usersAddress)
  const { data: delegationData, isFetched: isDelegationsFetched } =
    useAllTwabDelegations(usersAddress)
  const { t } = useTranslation()

  return (
    <div>
      <CardTitle title={t('delegations')} className='mb-2' />
      <AccountList>
        <BalanceDelegatedToItem usersAddress={usersAddress} />
        <TwabDelegatorItem delegator={usersAddress} />
        {isDelegationsFetched &&
          isAmountDelegatedToFetched &&
          delegationData.totalTokenWithUsdBalance.amountUnformatted.isZero() &&
          delegatedToData.delegatedAmount.amountUnformatted.isZero() && (
            <p className='opacity-70 text-xs'>
              <Trans
                i18nKey='delegationsLetYouShare'
                components={{
                  a: (
                    <ExternalLink
                      underline
                      href='https://tools.pooltogether.com/delegate'
                      children={undefined}
                    />
                  )
                }}
              />
            </p>
          )}
      </AccountList>
    </div>
  )
}
