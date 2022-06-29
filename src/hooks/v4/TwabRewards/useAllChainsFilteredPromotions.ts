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
import { getAmountFromBigNumber } from '@utils/getAmountFromBigNumber'

const FILTERED_PROMOTION_IDS = {
  [CHAIN_ID.rinkeby]: ['0x2', '0x4', '0x6'],
  // [CHAIN_ID.rinkeby]: ['0x1', '0x2', '0x3', '0x4', '0x5'],
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

  return { chainId, promotions }
}

const formatPromotionData = (promotion, promotionRpcData) => {
  const numberOfEpochs = Number(promotion.numberOfEpochs)
  const epochDuration = Number(promotion.epochDuration)
  const createdAt = Number(promotion.createdAt)
  const destroyedAt = Number(promotion.destroyedAt)
  const endedAt = Number(promotion.endedAt)
  const startTimestamp = Number(promotion.startTimestamp)

  const tokensPerEpoch = getAmountFromBigNumber(promotion.tokensPerEpoch, '2')

  const isComplete = Number(promotionRpcData.currentEpochId) >= numberOfEpochs

  // currentEpochId does not stop when it hits the max # of epochs for a promotion, so use the
  // smaller of the two resulting numbers
  const maxCompletedEpochId =
    promotionRpcData.currentEpochId === 0
      ? null
      : Math.min(promotionRpcData.currentEpochId, numberOfEpochs)

  const remainingEpochs = Number(promotion?.numberOfEpochs) - maxCompletedEpochId

  return {
    ...promotionRpcData,
    ...promotion,
    maxCompletedEpochId,
    remainingEpochs,
    isComplete,
    numberOfEpochs,
    epochDuration,
    createdAt,
    destroyedAt,
    endedAt,
    startTimestamp
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
