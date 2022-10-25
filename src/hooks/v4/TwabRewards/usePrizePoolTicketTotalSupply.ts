import { useRefetchInterval } from '@pooltogether/hooks'
import { getAmountFromUnformatted } from '@pooltogether/utilities'
import { PrizePool } from '@pooltogether/v4-client-js'
import { useQuery } from 'react-query'
import { usePrizePoolTicketDecimals } from '../PrizePool/usePrizePoolTicketDecimals'

export const PRIZE_POOL_TICKET_TOTAL_SUPPLY_QUERY_KEY = 'usePrizePoolTicketTotalSupply'

export const getPrizePoolTicketTotalSupplyQueryKey = (prizePool: PrizePool) => [
  PRIZE_POOL_TICKET_TOTAL_SUPPLY_QUERY_KEY,
  prizePool?.id()
]

export const usePrizePoolTicketTotalSupply = (prizePool: PrizePool) => {
  const refetchInterval = useRefetchInterval(prizePool?.chainId)
  const { data: decimals, isFetched } = usePrizePoolTicketDecimals(prizePool)
  const enabled = !!prizePool && isFetched
  return useQuery(
    getPrizePoolTicketTotalSupplyQueryKey(prizePool),
    async () => getPrizePoolTicketTotalSupply(prizePool, decimals),
    {
      enabled,
      refetchInterval
    }
  )
}

export const getPrizePoolTicketTotalSupply = async (prizePool: PrizePool, decimals: string) => {
  const amountUnformatted = await prizePool?.getTicketTotalSupply()
  return {
    prizePoolId: prizePool.id(),
    amount: getAmountFromUnformatted(amountUnformatted, decimals)
  }
}
