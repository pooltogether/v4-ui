import { useUsersPrizePoolBalances } from '@pooltogether/hooks'
import { PrizePool } from '@pooltogether/v4-client-js'
import { useUsersAddress } from '@pooltogether/wallet-connection'
import classNames from 'classnames'
import { InfoListItem } from '.'

export const TicketBalanceListItem = (props: {
  prizePool: PrizePool
  labelClassName?: string
  valueClassName?: string
}) => {
  const { prizePool, labelClassName, valueClassName } = props
  const usersAddress = useUsersAddress()
  const { data, isFetched } = useUsersPrizePoolBalances(usersAddress, prizePool)

  if (!usersAddress) return null

  return (
    <InfoListItem
      labelClassName={classNames(labelClassName)}
      valueClassName={valueClassName}
      label={'Current Ticket Balance'}
      loading={!isFetched}
      value={data?.balances.ticket.amountPretty}
    />
  )
}
