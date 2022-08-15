import { Amount, Token } from '@pooltogether/hooks'
import { useQueries, UseQueryOptions } from 'react-query'
import { useAllPrizeDistributorTokens } from './useAllPrizeDistributorTokens'
import { useAllAvailableDrawIds } from './useAllAvailableDrawIds'
import { usePrizeDistributors } from './usePrizeDistributors'
import { getUserClaimedAmounts, USERS_CLAIMED_AMOUNTS_QUERY_KEY } from './useUsersClaimedAmounts'

export const useAllUsersClaimedAmounts = (usersAddress: string) => {
  const prizeDistributors = usePrizeDistributors()
  const prizeDistributorTokensQueryResults = useAllPrizeDistributorTokens()
  const drawIdQueryResults = useAllAvailableDrawIds()

  const isAllTokensFetched = prizeDistributorTokensQueryResults.every(
    (queryResult) => queryResult.isFetched
  )
  const isAllAvailableDrawIdsFetched = drawIdQueryResults.every(
    (queryResult) => queryResult.isFetched
  )

  return useQueries<
    UseQueryOptions<{
      token: Token
      usersAddress: string
      prizeDistributorId: string
      claimedAmounts: { [drawId: number]: Amount }
    }>[]
  >(
    prizeDistributors.map((prizeDistributor) => ({
      queryKey: [USERS_CLAIMED_AMOUNTS_QUERY_KEY, prizeDistributor?.id(), usersAddress],
      queryFn: async () => {
        const drawIdQueryResult = drawIdQueryResults.find(
          (queryResult) => queryResult.data.prizeDistributorId === prizeDistributor.id()
        )
        const prizeDistributorTokensQueryResult = prizeDistributorTokensQueryResults.find(
          (queryResult) => queryResult.data.prizeDistributorId === prizeDistributor.id()
        )
        const drawIds = drawIdQueryResult.data.drawIds
        const prizeDistributorToken = prizeDistributorTokensQueryResult.data.token
        return getUserClaimedAmounts(usersAddress, prizeDistributor, drawIds, prizeDistributorToken)
      },
      enabled: isAllTokensFetched && Boolean(usersAddress) && isAllAvailableDrawIdsFetched
    }))
  )
}
