import { BigNumber } from '@ethersproject/bignumber'
import { msToS } from '@pooltogether/utilities'
import { PrizePool } from '@pooltogether/v4-client-js'
import { getAmountFromBigNumber } from '@utils/getAmountFromBigNumber'
import { useMemo } from 'react'
import { useQueries, useQuery } from 'react-query'
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

  return useQuery(
    [PRIZE_POOL_TICKET_TOTAL_SUPPLY_QUERY_KEY, prizePools.map((prizePool) => prizePool.id())],
    () => getPrizePoolNetworkTicketTwabTotalSupply(prizePools, decimals)
  )
}

const getPrizePoolNetworkTicketTwabTotalSupply = async (
  prizePools: PrizePool[],
  decimals: string
) => {
  const currentTimestamp = Math.round(msToS(Date.now()))
  const promises = prizePools.map((prizePool) =>
    getPrizePoolTicketTwabTotalSupply(prizePool, currentTimestamp, decimals)
  )
  const twabs = await Promise.all(promises)

  let networkTotalSupplyUnformatted = BigNumber.from(0)
  twabs.forEach(({ twab }) => {
    networkTotalSupplyUnformatted = networkTotalSupplyUnformatted.add(twab.amountUnformatted)
  })
  const totalSupply = getAmountFromBigNumber(networkTotalSupplyUnformatted, decimals)
  return {
    twabs,
    totalSupply
  }
}

const getPrizePoolTicketTwabTotalSupply = async (
  prizePool: PrizePool,
  currentTimestamp: number,
  decimals: string
) => {
  const twabUnformatted = await prizePool.getTicketTwabTotalSupplyAt(currentTimestamp)
  return {
    chainId: prizePool.chainId,
    timestamp: currentTimestamp,
    twab: getAmountFromBigNumber(twabUnformatted, decimals)
  }
}
