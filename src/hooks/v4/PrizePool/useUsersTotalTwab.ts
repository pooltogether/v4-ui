import { useSelectedPrizePoolTicketDecimals } from '@hooks/v4/PrizePool/useSelectedPrizePoolTicketDecimals'
import { Amount } from '@pooltogether/hooks'
import { getAmountFromUnformatted } from '@pooltogether/utilities'
import { ethers } from 'ethers'
import { useMemo } from 'react'
import { useQueries } from 'react-query'
import { usePrizePools } from './usePrizePools'
import { getUserPrizePoolTwab, getUsersPrizePoolTwabKey } from './useUsersPrizePoolTwab'

/**
 * Fetches the users current TWAB across all chains and combines
 * NOTE: Assumes all prize pool tickets have the same decimals
 * @param usersAddress
 * @returns
 */
export const useUsersTotalTwab = (usersAddress: string) => {
  // NOTE: Assumes all prize pool tickets have the same decimals
  const prizePools = usePrizePools()
  const { data: ticketDecimals, isFetched: isTicketDecimalsFetched } =
    useSelectedPrizePoolTicketDecimals()

  const queryResults = useQueries(
    prizePools.map((prizePool) => {
      // const refetchInterval = getRefetchInterval(prizePool.chainId)
      return {
        // refetchInterval: refetchInterval,
        queryKey: getUsersPrizePoolTwabKey(usersAddress, prizePool),
        queryFn: async () => getUserPrizePoolTwab(prizePool, usersAddress, ticketDecimals),
        enabled: Boolean(usersAddress) && isTicketDecimalsFetched
      }
    })
  )

  return useMemo(() => {
    const isFetched = queryResults.every((queryResult) => queryResult.isFetched)
    const isFetching = queryResults.some((queryResult) => queryResult.isFetching)
    const twabDataPerChain = queryResults.map((queryResults) => queryResults.data)
    const refetch = () => queryResults.forEach((queryResult) => queryResult.refetch())

    const twabAmounts: Amount[] = []
    twabDataPerChain.forEach((twabData) => {
      if (twabData && !twabData.twab.amountUnformatted.isZero()) {
        twabAmounts.push(twabData.twab)
      }
    })
    const twab = getTotalTwab(twabAmounts, ticketDecimals)

    return {
      data: {
        usersAddress,
        twab,
        twabDataPerChain
      },
      isFetching,
      isFetched,
      refetch
    }
  }, [queryResults, ticketDecimals, usersAddress])
}

const getTotalTwab = (twabs: Amount[], decimals: string) => {
  let total = ethers.constants.Zero
  twabs.forEach((twab) => {
    if (!twab || twab.amountUnformatted.isZero()) return
    total = total.add(twab.amountUnformatted)
  })
  return getAmountFromUnformatted(total, decimals)
}
