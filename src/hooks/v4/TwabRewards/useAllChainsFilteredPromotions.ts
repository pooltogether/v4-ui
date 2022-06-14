import { useQueries } from 'react-query'
import { GraphQLClient } from 'graphql-request'
import gql from 'graphql-tag'

import { CHAIN_ID } from '@constants/misc'
import { NO_REFETCH } from '@constants/query'
import { useSupportedTwabRewardsChainIds } from '@hooks/v4/TwabRewards/useSupportedTwabRewardsChainIds'
import { useTwabRewardsSubgraphClient } from '@hooks/v4/TwabRewards/useTwabRewardsSubgraphClient'

const FILTERED_PROMOTION_IDS = {
  [CHAIN_ID.rinkeby]: ['0x3', '0x4'],
  [CHAIN_ID.mumbai]: [],
  [CHAIN_ID.fuji]: [],
  [CHAIN_ID.avalanche]: [],
  [CHAIN_ID.mainnet]: [],
  [CHAIN_ID.polygon]: ['0x1', '0x5']
}

/**
 * Fetch all chain's promotions that have been 'allow listed'
 * @param usersAddress
 * @returns
 */
export const useAllChainsFilteredPromotions = () => {
  const chainIds = useSupportedTwabRewardsChainIds()

  return useQueries(
    chainIds.map((chainId) => {
      const client = useTwabRewardsSubgraphClient(chainId)

      return {
        ...NO_REFETCH,
        queryKey: getChainFilteredPromotionsKey(chainId),
        queryFn: async () => getChainFilteredPromotions(chainId, client),
        enabled: Boolean(chainId)
      }
    })
  )
}

const getChainFilteredPromotionsKey = (chainId: number) => ['getChainFilteredPromotions', chainId]

export const getChainFilteredPromotions = async (chainId: number, client: GraphQLClient) => {
  const query = promotionsQuery()
  const variables = { ids: FILTERED_PROMOTION_IDS[chainId] }

  const promotionsResponse = await client.request(query, variables).catch((e) => {
    console.error(e.message)
    throw e
  })
  const { promotions } = promotionsResponse || {}

  return { chainId, promotions }
}

const promotionsQuery = () => {
  return gql`
    query promotionsQuery($ids: [String!]!) {
      promotions(where: { id_in: $ids }) {
        id
        creator
        createdAt
        endedAt
        destroyedAt
        startTimestamp
        numberOfEpochs
        epochDuration
        tokensPerEpoch
        rewardsUnclaimed
        token
        ticket {
          id
        }
      }
    }
  `
}
