import gql from 'graphql-tag'
import { GraphQLClient } from 'graphql-request'
import { Amount, Token } from '@pooltogether/hooks'
import { NO_REFETCH } from '@constants/query'
import { useQueries, UseQueryOptions } from 'react-query'
import { useAllPrizeDistributorTokens } from './useAllPrizeDistributorTokens'
import { useAllValidDrawIds } from './useAllValidDrawIds'
import { usePrizeDistributors } from './usePrizeDistributors'
import { getPrizesClaimedSubgraphClient } from '@hooks/v4/TwabRewards/getPrizesClaimedSubgraphClient'

const getAllUsersClaimedAmountsGraphQueryKey = (chainId: number, usersAddress: string) => [
  'useAllUsersClaimedAmountsGraph',
  chainId,
  usersAddress
]

export const useAllUsersClaimedAmountsGraph = (usersAddress: string) => {
  const prizeDistributors = usePrizeDistributors()

  return useQueries<
    UseQueryOptions<{
      totalClaimed: string
    }>[]
  >(
    prizeDistributors.map((prizeDistributor) => ({
      ...NO_REFETCH,
      queryKey: getAllUsersClaimedAmountsGraphQueryKey(prizeDistributor.chainId, usersAddress),
      queryFn: async () => {
        const { chainId } = prizeDistributor
        const client = getPrizesClaimedSubgraphClient(chainId)

        return getUsersClaimedAmountsGraph(chainId, usersAddress, client)
      },
      enabled: Boolean(usersAddress) // && isAllValidDrawIdsFetched
    }))
  )
}

export const getUsersClaimedAmountsGraph = async (
  chainId: number,
  usersAddress: string,
  client: GraphQLClient
): Promise<{
  chainId: number
  totalClaimed: string
  // claimedAmounts: { [drawId: number]: Amount }
}> => {
  // const response = await client.fetch(usersAddress, drawIds)

  const query = accountQuery()
  const variables = { id: usersAddress.toLowerCase() }

  const claimedPrizesResponse = await client.request(query, variables).catch((e) => {
    console.error(e.message)
    throw e
  })

  const { account } = claimedPrizesResponse || {}
  const { totalClaimed } = account || {}

  // const claimedAmountsKeyedByDrawId: {
  //   [drawId: number]: Amount
  // } = {}

  // drawIds.map((drawId) => {
  //   claimedAmountsKeyedByDrawId[drawId] = roundPrizeAmount(claimedAmounts[drawId], token.decimals)
  // })

  return {
    chainId,
    totalClaimed
    // claimedAmounts: claimedAmountsKeyedByDrawId
  }
}

const accountQuery = () => {
  return gql`
    query accountQuery($id: String!) {
      account(id: $id) {
        id
        totalClaimed
        draws {
          id
        }
      }
    }
  `
}
