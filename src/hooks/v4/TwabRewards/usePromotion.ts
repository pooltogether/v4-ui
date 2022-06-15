import { batch } from '@pooltogether/etherplex'
import { useQuery } from 'react-query'
import { getReadProvider } from '@pooltogether/wallet-connection'
import { RPC_API_KEYS } from '@constants/config'

import { NO_REFETCH } from '@constants/query'
import {
  getTwabRewardsEtherplexContract,
  getTwabRewardsContractAddress
} from '@utils/TwabRewards/getTwabRewardsContract'

/**
 * Fetch a promotion's data (eg. currentEpochId, etc)
 * @returns
 */
export const usePromotion = (chainId: number, promotionId: number) => {
  return useQuery(
    getChainPromotionKey(chainId, promotionId),
    async () => getPromotion(chainId, promotionId),
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
