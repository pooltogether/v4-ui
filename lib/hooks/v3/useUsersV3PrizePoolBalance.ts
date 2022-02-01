import { useMemo } from 'react'

import { useAllUsersV3Balances, V3PrizePoolBalances } from './useAllUsersV3Balances'

export const useUsersV3PrizePoolBalance = (
  usersAddress: string,
  chainId: number,
  prizePoolAddress: string,
  ticketAddress: string
) => {
  const queriesResult = useAllUsersV3Balances(usersAddress)

  return useMemo(() => {
    const refetch = async () => queriesResult.forEach((queryResult) => queryResult.refetch())
    const isFetched = queriesResult.every((queryResult) => queryResult.isFetched)

    if (!isFetched) {
      return {
        isFetching: true,
        isFetched: false,
        refetch,
        data: null
      }
    }

    let balance: V3PrizePoolBalances

    queriesResult.forEach((queryResult) => {
      const { data: balancesForChainId } = queryResult

      if (balancesForChainId.chainId === chainId) {
        balance = balancesForChainId.balances.find((balance) => {
          const isRightPool = balance.prizePool.addresses.prizePool === prizePoolAddress
          const isRightTicket = balance.prizePool.addresses.ticket === ticketAddress
          return isRightPool && isRightTicket
        })
      }
    })

    return {
      isFetching: false,
      isFetched: true,
      refetch,
      data: balance
    }
  }, [queriesResult])
}
