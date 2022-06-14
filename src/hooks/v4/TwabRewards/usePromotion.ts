import { useQuery } from 'react-query'

import { NO_REFETCH } from '@constants/query'

/**
 * Fetch a promotion's currentEpochId, etc
 * @returns
 */
export const usePromotion = (chainId: number, promotionId: number) => {
  return useQuery(
    getChainPromotionKey(chainId, promotionId),
    async () => getPromotion(promotionId),
    {
      ...NO_REFETCH,
      enabled: Boolean(promotionId)
    }
  )
}

const getChainPromotionKey = (chainId: number, promotionId: number) => [
  'getChainPromotion',
  chainId,
  promotionId
]

export const getPromotion = async (chainId: number, promotionId: number) => {
  const twabRewardsContract = contract(
    twabRewardsContractAddress,
    TwabRewardsAbi,
    twabRewardsContractAddress
  )
  const twabRewardsResults = await batch(provider, twabRewardsContract.getCurrentEpochId())

  const currentEpochId = twabRewardsResults[twabRewardsContractAddress].getCurrentEpochId[0]

  return {}
}
