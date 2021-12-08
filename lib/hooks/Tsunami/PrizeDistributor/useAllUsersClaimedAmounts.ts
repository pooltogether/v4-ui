import { Amount } from '@pooltogether/hooks'
import { NO_REFETCH } from 'lib/constants/query'
import { useQueries, UseQueryOptions } from 'react-query'
import { useTicketDecimals } from '../PrizePool/useTicketDecimals'
import { useAllValidDrawIds } from './useAllValidDrawIds'
import { usePrizeDistributors } from './usePrizeDistributors'
import { getUsersClaimedAmounts, USERS_CLAIMED_AMOUNTS_QUERY_KEY } from './useUsersClaimedAmounts'

export const useAllUsersClaimedAmounts = (usersAddress: string) => {
  const prizeDistributors = usePrizeDistributors()
  const drawIdQueryResults = useAllValidDrawIds()
  const { data: decimals, isFetched: isDecimalsFetched } = useTicketDecimals()
  const isAllValidDrawIdsFetched = drawIdQueryResults.every((queryResult) => queryResult.isFetched)

  return useQueries<
    UseQueryOptions<{
      usersAddress: string
      prizeDistributorId: string
      claimedAmounts: { [drawId: number]: Amount }
    }>[]
  >(
    prizeDistributors.map((prizeDistributor) => ({
      ...NO_REFETCH,
      queryKey: [USERS_CLAIMED_AMOUNTS_QUERY_KEY, prizeDistributor?.id(), usersAddress],
      queryFn: async () => {
        const drawIdQueryResult = drawIdQueryResults.find(
          (queryResult) => queryResult.data.prizeDistributorId === prizeDistributor.id()
        )
        const drawIds = drawIdQueryResult.data.drawIds
        return getUsersClaimedAmounts(usersAddress, prizeDistributor, drawIds, decimals)
      },
      enabled: isDecimalsFetched && Boolean(usersAddress) && isAllValidDrawIdsFetched
    }))
  )
}
