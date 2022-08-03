import gql from 'graphql-tag'
import { GraphQLClient } from 'graphql-request'
import { useQueries } from 'react-query'

import { sToMs } from '@pooltogether/utilities'

import { FILTERED_PROMOTION_IDS } from '@constants/promotions'
import { getTwabRewardsSubgraphClient } from '@utils/v4/TwabRewards/getTwabRewardsSubgraphClient'

export const useGraphFilteredPromotions = (chainIds) => {
  return useQueries(
    chainIds.map((chainId) => {
      const client = getTwabRewardsSubgraphClient(chainId)

      return {
        refetchInterval: sToMs(60),
        queryKey: getGraphFilteredPromotionsKey(chainId),
        queryFn: async () => getGraphFilteredPromotions(chainId, client),
        enabled: Boolean(chainId)
      }
    })
  )
}

const getGraphFilteredPromotionsKey = (chainId: number) => ['getGraphFilteredPromotions', chainId]

const getGraphFilteredPromotions = async (chainId: number, client: GraphQLClient) => {
  const query = promotionsQuery()
  const variables = { ids: FILTERED_PROMOTION_IDS[chainId].map((id) => `0x${id.toString(16)}`) }

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
