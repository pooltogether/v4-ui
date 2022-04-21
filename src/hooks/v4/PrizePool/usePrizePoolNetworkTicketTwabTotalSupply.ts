import { BigNumber } from '@ethersproject/bignumber'
import { msToS } from '@pooltogether/utilities'
import { getAmountFromBigNumber } from '@utils/getAmountFromBigNumber'
import { useQueries } from 'react-query'
import { usePrizePools } from './usePrizePools'
import { PRIZE_POOL_TICKET_TOTAL_SUPPLY_QUERY_KEY } from './usePrizePoolTicketTotalSupply'
import { useSelectedPrizePoolTicketDecimals } from './useSelectedPrizePoolTicketDecimals'

/**
 * Fetches the total supply of tickets that have been delegated at this current time.
 * NOTE: Assumes all tickets have the same decimals
 * @returns
 */
export const usePrizePoolNetworkTicketTwabTotalSupply = () => {
  const prizePools = usePrizePools()
  const { data: decimals } = useSelectedPrizePoolTicketDecimals()

  const queryResults = useQueries(
    prizePools.map((prizePool) => {
      return {
        queryKey: [PRIZE_POOL_TICKET_TOTAL_SUPPLY_QUERY_KEY, prizePool?.id()],
        queryFn: () => {
          const timestamp = Math.round(msToS(Date.now()))
          return prizePool?.getTicketTwabTotalSupplyAt(timestamp)
        },
        enabled: Boolean(decimals)
      }
    })
  )

  const isFetched = queryResults.every((queryResult) => queryResult.isFetched)

  let networkTotalSupplyUnformatted = BigNumber.from(0)
  queryResults.forEach((queryResult) => {
    const { data: totalSupplyUnformatted, isFetched } = queryResult
    if (isFetched) {
      networkTotalSupplyUnformatted = networkTotalSupplyUnformatted.add(totalSupplyUnformatted)
    }
  })

  const totalSupply = getAmountFromBigNumber(networkTotalSupplyUnformatted, decimals)

  return {
    data: totalSupply,
    isFetched
  }
}
