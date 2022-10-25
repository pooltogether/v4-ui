import { useUsersPrizePoolBalancesWithFiat } from '@hooks/v4/PrizePool/useUsersPrizePoolBalancesWithFiat'
import { PrizePool } from '@pooltogether/v4-client-js'
import { useUsersAddress } from '@pooltogether/wallet-connection'
import classNames from 'classnames'
import { useTranslation } from 'next-i18next'
import { InfoListItem } from '.'

export const TicketBalanceListItem = (props: {
  prizePool: PrizePool
  labelClassName?: string
  valueClassName?: string
}) => {
  const { prizePool, labelClassName, valueClassName } = props
  const usersAddress = useUsersAddress()
  const { data, isFetched } = useUsersPrizePoolBalancesWithFiat(usersAddress, prizePool)
  const { t } = useTranslation()

  if (!usersAddress) return null

  return (
    <InfoListItem
      labelClassName={classNames(labelClassName)}
      valueClassName={valueClassName}
      label={t('currentTicketBalance')}
      loading={!isFetched}
      value={data?.balances.ticket.amountPretty}
    />
  )
}
