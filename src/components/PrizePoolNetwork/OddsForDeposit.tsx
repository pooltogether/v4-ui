import { usePrizePoolTicketDecimals } from '@hooks/v4/PrizePool/usePrizePoolTicketDecimals'
import { useSpoofedPrizePoolNetworkOdds } from '@hooks/v4/PrizePoolNetwork/useSpoofedPrizePoolNetworkOdds'
import { numberWithCommas } from '@pooltogether/utilities'
import { PrizePool } from '@pooltogether/v4-client-js'

/**
 * @param props
 * @returns
 */
export const OddsForDeposit = (props: { amount: string; prizePool: PrizePool }) => {
  const { prizePool, amount } = props
  const { data: decimals } = usePrizePoolTicketDecimals(prizePool)
  const { data, isFetched } = useSpoofedPrizePoolNetworkOdds(amount, decimals, prizePool.id())

  return <>{isFetched ? `1:${numberWithCommas(data?.oneOverOdds, { precision: 2 })}` : null}</>
}
