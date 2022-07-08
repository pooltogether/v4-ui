import gql from 'graphql-tag'
import { batch } from '@pooltogether/etherplex'
import { GraphQLClient } from 'graphql-request'
import { useQueries } from 'react-query'
import { getReadProvider } from '@pooltogether/wallet-connection'
import { RPC_API_KEYS } from '@constants/config'
import { sToMs } from '@pooltogether/utilities'

import { CHAIN_ID } from '@constants/misc'
import { useSupportedTwabRewardsChainIds } from '@hooks/v4/TwabRewards/useSupportedTwabRewardsChainIds'
import { useTwabRewardsSubgraphClient } from '@hooks/v4/TwabRewards/useTwabRewardsSubgraphClient'
import {
  getTwabRewardsEtherplexContract,
  getTwabRewardsContractAddress
} from '@utils/TwabRewards/getTwabRewardsContract'

export const FILTERED_PROMOTION_IDS = {
  [CHAIN_ID['optimism-kovan']]: [],
  [CHAIN_ID.mumbai]: [],
  [CHAIN_ID.rinkeby]: [10, 12],
  [CHAIN_ID.fuji]: [],
  [CHAIN_ID.optimism]: [],
  [CHAIN_ID.polygon]: [],
  [CHAIN_ID.mainnet]: [],
  [CHAIN_ID.avalanche]: []
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
        refetchInterval: sToMs(60),
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
  const variables = { ids: FILTERED_PROMOTION_IDS[chainId].map((id) => `0x${id.toString(16)}`) }

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
  promotion = {
    ...promotion,
    numberOfEpochs: Number(promotion.numberOfEpochs),
    epochDuration: Number(promotion.epochDuration),
    createdAt: Number(promotion.createdAt),
    destroyedAt: Number(promotion.destroyedAt),
    endedAt: Number(promotion.endedAt),
    startTimestamp: Number(promotion.startTimestamp)
  }

  const isComplete = Number(promotionRpcData.currentEpochId) >= promotion.numberOfEpochs

  // currentEpochId does not stop when it hits the max # of epochs for a promotion, so use the
  // smaller of the two resulting numbers
  const maxCompletedEpochId =
    promotionRpcData.currentEpochId === 0
      ? null
      : Math.min(promotionRpcData.currentEpochId, promotion.numberOfEpochs)

  const remainingEpochs = Number(promotion?.numberOfEpochs) - maxCompletedEpochId

  const duration = promotion.numberOfEpochs * promotion.epochDuration
  const endTimestamp = promotion.startTimestamp + duration

  const epochs = buildEpochs(promotion, maxCompletedEpochId, remainingEpochs)

  return {
    ...promotionRpcData,
    ...promotion,
    epochs: {
      ...epochs
    },
    maxCompletedEpochId,
    remainingEpochs,
    isComplete,
    endTimestamp
  }
}

const buildEpochs = (promotion, maxCompletedEpochId, remainingEpochs) => {
  const { numberOfEpochs, startTimestamp, epochDuration } = promotion

  if (remainingEpochs <= 0) {
    return []
  }

  const epochsArray = [...Array(numberOfEpochs).keys()]

  const epochs = epochsArray.map((epoch) => {
    const epochStartTimestamp = Number(startTimestamp) + epoch * Number(epochDuration)
    const epochEndTimestamp = epochStartTimestamp + Number(epochDuration)
    return { epochStartTimestamp, epochEndTimestamp }
  })

  const remainingEpochsArray = epochs.slice(maxCompletedEpochId || 0, Number(numberOfEpochs))

  return { epochs, remainingEpochsArray }
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
