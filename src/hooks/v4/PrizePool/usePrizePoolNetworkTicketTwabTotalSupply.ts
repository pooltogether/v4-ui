import { BigNumber } from '@ethersproject/bignumber'
import { getAmountFromBigNumber } from '@utils/getAmountFromBigNumber'
import { useQueries } from 'react-query'
import { usePrizePools } from './usePrizePools'
import { useSelectedPrizePoolTicketDecimals } from './useSelectedPrizePoolTicketDecimals'

const MULTI_PRIZE_POOL_TICKET_TOTAL_SUPPLY_QUERY_KEY =
  'MULTI_PRIZE_POOL_TICKET_TOTAL_SUPPLY_QUERY_KEY'

/**
 * Fetches the total supply of tickets that have been delegated at this current time.
 * NOTE: Assumes all tickets have the same decimals
 */
export const usePrizePoolNetworkTicketTwabTotalSupply = () => {
  const prizePools = usePrizePools()
  const { data: decimals } = useSelectedPrizePoolTicketDecimals()

  const queryResults = useQueries(
    prizePools.map((prizePool) => {
      return {
        queryKey: [MULTI_PRIZE_POOL_TICKET_TOTAL_SUPPLY_QUERY_KEY, prizePool?.id()],
        queryFn: () => prizePool?.getTicketTotalSupply(),
        enabled: Boolean(decimals)
      }
    })
  )

  const isFetched = queryResults.every((queryResult) => queryResult.isFetched)

  let networkTotalSupplyUnformatted = BigNumber.from(0)
  queryResults.forEach((queryResult) => {
    const { data: totalSupplyUnformatted, isFetched, error } = queryResult
    if (isFetched && totalSupplyUnformatted) {
      networkTotalSupplyUnformatted = networkTotalSupplyUnformatted.add(totalSupplyUnformatted)
    }
  })

  const totalSupply = getAmountFromBigNumber(networkTotalSupplyUnformatted, decimals)

  return {
    data: totalSupply,
    isFetched
  }
}
