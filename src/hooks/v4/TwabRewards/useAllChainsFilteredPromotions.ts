import { batch } from '@pooltogether/etherplex'
import { useQueries } from 'react-query'
import { sToMs } from '@pooltogether/utilities'
import { BigNumber } from 'ethers'

import { Promotion } from '@interfaces/promotions'
import { useGraphFilteredPromotions } from '@hooks/v4/TwabRewards/useGraphFilteredPromotions'
import { useRpcFilteredPromotions } from '@hooks/v4/TwabRewards/useRpcFilteredPromotions'
import { useSupportedTwabRewardsChainIds } from '@hooks/v4/TwabRewards/useSupportedTwabRewardsChainIds'
import {
  getTwabRewardsEtherplexContract,
  getTwabRewardsContractAddress
} from '@utils/v4/TwabRewards/getTwabRewardsContract'

/**
 * Fetch all chain's promotions that have been allow-listed
 * @param usersAddress
 * @returns
 */
export const useAllChainsFilteredPromotions = () => {
  const chainIds = useSupportedTwabRewardsChainIds()

  const graphQueryResults = useGraphFilteredPromotions(chainIds)
  const rpcQueryResults = useRpcFilteredPromotions(chainIds)

  const graphIsFetched = graphQueryResults.every((queryResult) => queryResult.isFetched)
  const graphIsError = graphQueryResults.some((queryResult) => queryResult.isError)

  const rpcIsFetched = rpcQueryResults.every((queryResult) => queryResult.isFetched)
  const rpcIsError = rpcQueryResults.some((queryResult) => queryResult.isError)

  const isFetched = graphIsFetched && rpcIsFetched
  const isError = graphIsError && rpcIsError

  return useQueries(
    chainIds.map((chainId) => {
      return {
        refetchInterval: sToMs(60),
        queryKey: getAllFilteredPromotionsKey(chainId),
        queryFn: async () => getAllFilteredPromotions(chainId, graphQueryResults, rpcQueryResults),
        enabled: isFetched && !isError
      }
    })
  )
}

const getAllFilteredPromotionsKey = (chainId: number) => ['getAllFilteredPromotions', chainId]

const getAllFilteredPromotions = async (chainId, graphQueryResults, rpcQueryResults) => {
  let promotions: Array<Promotion> = []

  const graphPromotions = graphQueryResults.find((result) => result.data.chainId === chainId).data
    .promotions
  const rpcPromotions = rpcQueryResults.find((result) => result.data.chainId === chainId).data
    .promotions

  for (let i = 0; i < graphPromotions.length; i++) {
    const graphPromotion = graphPromotions[i]
    const rpcPromotion = rpcPromotions[i]

    const promotion = combinePromotionData(chainId, graphPromotion, rpcPromotion)
    promotions.push(promotion)
  }

  return { chainId, promotions }
}

const combinePromotionData = (chainId: number, promotion, promotionRpcData): Promotion => {
  promotion = {
    ...promotion,
    chainId,
    numberOfEpochs: Number(promotion.numberOfEpochs),
    epochDuration: Number(promotion.epochDuration),
    createdAt: Number(promotion.createdAt),
    destroyedAt: Number(promotion.destroyedAt),
    endedAt: Number(promotion.endedAt),
    startTimestamp: Number(promotion.startTimestamp)
  }

  const isComplete = promotionRpcData.currentEpochId >= promotion.numberOfEpochs

  promotion.totalTokensDistributed = BigNumber.from(promotion.tokensPerEpoch).mul(
    promotion.numberOfEpochs
  )

  // currentEpochId does not stop when it hits the max # of epochs for a promotion, so use the
  // smaller of the two resulting numbers
  const maxCompletedEpochId =
    promotionRpcData.currentEpochId === 0
      ? null
      : Math.min(promotionRpcData.currentEpochId, promotion.numberOfEpochs)

  const remainingEpochs = promotion.numberOfEpochs - maxCompletedEpochId

  const duration = promotion.numberOfEpochs * promotion.epochDuration
  const endTimestamp = promotion.startTimestamp + duration

  const epochCollection = getEpochCollection(promotion, maxCompletedEpochId, remainingEpochs)

  return {
    ...promotionRpcData,
    ...promotion,
    epochCollection,
    maxCompletedEpochId,
    remainingEpochs,
    isComplete,
    endTimestamp
  }
}

const getEpochCollection = (promotion, maxCompletedEpochId, remainingEpochs) => {
  const { numberOfEpochs, startTimestamp, epochDuration } = promotion

  if (remainingEpochs <= 0) {
    return []
  }

  let epochs = []
  for (let epochNum = 0; epochNum < numberOfEpochs; epochNum++) {
    const epochStartTimestamp = startTimestamp + epochNum * epochDuration
    const epochEndTimestamp = epochStartTimestamp + epochDuration
    epochs.push({ epochStartTimestamp, epochEndTimestamp })
  }

  const remainingEpochsArray = epochs.slice(maxCompletedEpochId || 0, numberOfEpochs)

  return { epochs, remainingEpochsArray }
}

export const getPromotion = async (chainId: number, promotionId: number) => {
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
