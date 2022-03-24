import { BigNumber } from '@ethersproject/bignumber'
import { getAmountFromBigNumber } from '@utils/getAmountFromBigNumber'
import { useMemo } from 'react'
import { useQueries } from 'react-query'
import { usePrizePools } from './usePrizePools'
import { PRIZE_POOL_TICKET_TOTAL_SUPPLY_QUERY_KEY } from './usePrizePoolTicketTotalSupply'
import { useSelectedPrizePoolTicketDecimals } from './useSelectedPrizePoolTicketDecimals'

// TODO: getRefetchInterval
// NOTE: Assumes all tickets have the same decimals
export const usePrizePoolNetworkTicketTotalSupply = () => {
  const prizePools = usePrizePools()
  const { data: decimals } = useSelectedPrizePoolTicketDecimals()

  const queryResults = useQueries(
    prizePools.map((prizePool) => {
      return {
        queryKey: [PRIZE_POOL_TICKET_TOTAL_SUPPLY_QUERY_KEY, prizePool?.id()],
        queryFn: () => prizePool?.getTicketTotalSupply(),
        enabled: Boolean(decimals)
      }
    })
  )

  return useMemo(() => {
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
  }, [queryResults, decimals])
}
