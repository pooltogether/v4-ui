import { CurrencyValue } from '@components/CurrencyValue'
import { usePrizePoolTicketTotalSupply } from '@hooks/v4/TwabRewards/usePrizePoolTicketTotalSupply'
import { PrizePool } from '@pooltogether/v4-client-js'
import classNames from 'classnames'

export const TotalAmountDeposited = (props: { prizePool: PrizePool; className?: string }) => {
  const { data, isFetched, isError } = usePrizePoolTicketTotalSupply(props.prizePool)

  return (
    <span className={classNames(props.className)}>
      {isFetched && !isError && (
        <CurrencyValue baseValue={data?.amount.amount} options={{ notation: 'compact' }} />
      )}
    </span>
  )
}
