import gql from 'graphql-tag'
import { BigNumber } from 'ethers'
import { GraphQLClient } from 'graphql-request'
import { Token, Amount } from '@pooltogether/hooks'
import { NO_REFETCH } from '@constants/query'
import { useQueries, UseQueryOptions } from 'react-query'

import { useAllPrizePoolTokens } from '@hooks/v4/PrizePool/useAllPrizePoolTokens'
import { usePrizePools } from '@hooks/v4/PrizePool/usePrizePools'
import { usePrizeDistributors } from '@hooks/v4/PrizeDistributor/usePrizeDistributors'
import { getPrizesClaimedSubgraphClient } from '@hooks/v4/TwabRewards/getPrizesClaimedSubgraphClient'
import { roundPrizeAmount } from '@utils/roundPrizeAmount'

const getAllUsersClaimedAmountsGraphQueryKey = (chainId: number, usersAddress: string) => [
  'useAllUsersClaimedAmountsGraph',
  chainId,
  usersAddress
]

export const useAllUsersClaimedAmountsGraph = (usersAddress: string) => {
  const prizeDistributors = usePrizeDistributors()
  const prizePools = usePrizePools()
  const tokens = useAllPrizePoolTokens()

  return useQueries<
    UseQueryOptions<{
      chainId: number
      totalClaimed: string
      ticket: Token
      claimedAmounts: { [drawId: number]: Amount }
    }>[]
  >(
    prizeDistributors.map((prizeDistributor) => ({
      ...NO_REFETCH,
      queryKey: getAllUsersClaimedAmountsGraphQueryKey(prizeDistributor.chainId, usersAddress),
      queryFn: async () => {
        const { chainId } = prizeDistributor
        const client = getPrizesClaimedSubgraphClient(chainId)

        const prizePool = prizePools.find((prizePool) => prizePool.chainId === chainId)
        const tokenData = tokens.find(
          (tokenData) => tokenData.data.prizePoolId === prizePool.id()
        ).data
        const { ticket } = tokenData

        return getUsersClaimedAmountsGraph(chainId, usersAddress, ticket, client)
      },
      enabled: Boolean(usersAddress)
    }))
  )
}

export const getUsersClaimedAmountsGraph = async (
  chainId: number,
  usersAddress: string,
  ticket: Token,
  client: GraphQLClient
): Promise<{
  chainId: number
  totalClaimed: string
  ticket: Token
  claimedAmounts: { [drawId: number]: Amount }
}> => {
  const query = accountQuery()
  const variables = { id: usersAddress.toLowerCase() }

  const claimedPrizesResponse = await client.request(query, variables).catch((e) => {
    console.error(e.message)
    throw e
  })

  const { account } = claimedPrizesResponse || {}
  const { totalClaimed, draws } = account || {}

  const claimedAmountsKeyedByDrawId: {
    [drawId: number]: Amount
  } = {}

  draws?.map((draw) => {
    claimedAmountsKeyedByDrawId[draw.id.split('-')[1]] = roundPrizeAmount(
      BigNumber.from(draw.claimed),
      ticket.decimals
    )
  })

  return {
    chainId,
    totalClaimed,
    ticket,
    claimedAmounts: claimedAmountsKeyedByDrawId
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
          claimed
        }
      }
    }
  `
}
