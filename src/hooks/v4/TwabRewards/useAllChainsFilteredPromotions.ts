import gql from 'graphql-tag'
import { batch } from '@pooltogether/etherplex'
import { GraphQLClient } from 'graphql-request'
import { useQueries } from 'react-query'
import { getReadProvider } from '@pooltogether/wallet-connection'
import { RPC_API_KEYS } from '@constants/config'

import { CHAIN_ID } from '@constants/misc'
import { NO_REFETCH } from '@constants/query'
import { useSupportedTwabRewardsChainIds } from '@hooks/v4/TwabRewards/useSupportedTwabRewardsChainIds'
import { useTwabRewardsSubgraphClient } from '@hooks/v4/TwabRewards/useTwabRewardsSubgraphClient'
import {
  getTwabRewardsEtherplexContract,
  getTwabRewardsContractAddress
} from '@utils/TwabRewards/getTwabRewardsContract'

const FILTERED_PROMOTION_IDS = {
  [CHAIN_ID.rinkeby]: ['0x2', '0x4'],
  // [CHAIN_ID.rinkeby]: ['0x4', '0x5'],
  [CHAIN_ID.mumbai]: ['0x1', '0x2'],
  [CHAIN_ID.fuji]: ['0x1', '0x2'],
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
        queryKey: getGraphFilteredPromotionsKey(chainId),
        queryFn: async () => getGraphFilteredPromotions(chainId, client),
        enabled: Boolean(chainId)
      }
    })
  )
}

const getGraphFilteredPromotionsKey = (chainId: number) => ['getGraphFilteredPromotions', chainId]

export const getGraphFilteredPromotions = async (chainId: number, client: GraphQLClient) => {
  const query = promotionsQuery()
  const variables = { ids: FILTERED_PROMOTION_IDS[chainId] }

  const promotionsResponse = await client.request(query, variables).catch((e) => {
    console.error(e.message)
    throw e
  })
  const { promotions } = promotionsResponse || {}

  for (let i = 0; i < promotions.length; i++) {
    const promotion = promotions[i]

    // Pull data from chain
    const promotionRpcData = await getPromotion(chainId, Number(promotions[i].id))

    promotions[i] = formatPromotionData(promotion, promotionRpcData)
  }
  console.log(promotions)

  return { chainId, promotions }
}

const formatPromotionData = (promotion, promotionRpcData) => {
  // Massage ze datas
  const adjustedNumberOfEpochs = Number(promotion.numberOfEpochs) - 1
  const isComplete = Number(promotionRpcData.currentEpochId) >= Number(promotion.numberOfEpochs)

  // currentEpochId does not stop when it hits the max # of epochs for a promotion, so use the
  // smaller of the two resulting numbers
  const adjustedCurrentEpochId = Math.min(promotionRpcData.currentEpochId, adjustedNumberOfEpochs)

  const remainingEpochs = Number(promotion?.numberOfEpochs) - adjustedCurrentEpochId

  return {
    ...promotionRpcData,
    ...promotion,
    remainingEpochs,
    isComplete,
    adjustedCurrentEpochId
  }
}

export const getPromotion = async (chainId: number, promotionId: number) => {
  const provider = getReadProvider(chainId, RPC_API_KEYS)
  const twabRewardsContract = getTwabRewardsEtherplexContract(chainId)
  const twabRewardsContractAddress = getTwabRewardsContractAddress(chainId)

  const twabRewardsResults = await batch(
    provider,
    twabRewardsContract.getCurrentEpochId(promotionId)
  )

  const currentEpochId = Number(
    twabRewardsResults[twabRewardsContractAddress].getCurrentEpochId[0].toString()
  )

  return { currentEpochId }
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
