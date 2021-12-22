import { useMemo } from 'react'
import { Amount } from '@pooltogether/hooks'
import { ethers } from 'ethers'
import { useQueries } from 'react-query'

import { useTicketDecimals } from 'lib/hooks/v4/PrizePool/useTicketDecimals'
import { getAmountFromBigNumber } from 'lib/utils/getAmountFromBigNumber'
import { usePrizePools } from './usePrizePools'
import { USERS_TWAB_QUERY_KEY, getUsersPrizePoolTwab } from './useUsersPrizePoolTwab'

export const useUsersTotalTwab = (
  usersAddress: string
): {
  data: {
    usersAddress: string
    twab: Amount
  }
  isFetching: boolean
  isFetched: boolean
  refetch: () => void
} => {
  // NOTE: Assumes all prize pool tickets have the same decimals
  const { data: ticketDecimals, isFetched: isTicketDecimalsFetched } = useTicketDecimals()
  const prizePools = usePrizePools()

  const queryResults = useQueries(
    prizePools.map((prizePool) => {
      return {
        queryKey: [USERS_TWAB_QUERY_KEY, prizePool?.id(), usersAddress],
        queryFn: async () => getUsersPrizePoolTwab(prizePool, usersAddress, ticketDecimals),
        enabled: Boolean(usersAddress) && isTicketDecimalsFetched
      }
    })
  )

  return useMemo(() => {
    const isFetched = queryResults.every((queryResult) => queryResult.isFetched)
    const isFetching = queryResults.some((queryResult) => queryResult.isFetching)
    const twabDatas = queryResults.map((queryResults) => queryResults.data)
    const refetch = () => queryResults.forEach((queryResult) => queryResult.refetch())

    const twabAmounts: Amount[] = []
    twabDatas.forEach((twabData) => {
      if (twabData && !twabData.twab.amountUnformatted.isZero()) {
        twabAmounts.push(twabData.twab)
      }
    })
    const twab = getTotalTwab(twabAmounts, ticketDecimals)

    return {
      data: {
        usersAddress,
        twab
      },
      isFetching,
      isFetched,
      refetch
    }
  }, [queryResults])
}

const getTotalTwab = (twabs: Amount[], decimals: string) => {
  let total = ethers.constants.Zero
  twabs.forEach((twab) => {
    if (!twab || twab.amountUnformatted.isZero()) return
    total = total.add(twab.amountUnformatted)
  })
  return getAmountFromBigNumber(total, decimals)
}
