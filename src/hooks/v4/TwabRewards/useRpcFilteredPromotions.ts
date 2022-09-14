import { Provider } from '@ethersproject/providers'
import { batch } from '@pooltogether/etherplex'
import { useQueries } from 'react-query'
import { sToMs } from '@pooltogether/utilities'
import { FILTERED_PROMOTION_IDS } from '@constants/promotions'
import {
  getTwabRewardsEtherplexContract,
  getTwabRewardsContractAddress
} from '@utils/v4/TwabRewards/getTwabRewardsContract'
import { getReadProvider } from '@pooltogether/wallet-connection'

export const useRpcFilteredPromotions = (chainIds) => {
  return useQueries(
    chainIds.map((chainId) => {
      const provider = getReadProvider(chainId)

      return {
        refetchInterval: sToMs(60),
        queryKey: getRpcFilteredPromotionsKey(chainId),
        queryFn: async () => getRpcFilteredPromotions(chainId, provider),
        enabled: Boolean(chainId)
      }
    })
  )
}

const getRpcFilteredPromotionsKey = (chainId: number) => ['getRpcFilteredPromotions', chainId]

const getRpcFilteredPromotions = async (chainId: number, provider: Provider) => {
  let promotions = []
  const ids = FILTERED_PROMOTION_IDS[chainId]

  for (let i = 0; i < ids.length; i++) {
    const promotionId = ids[i]

    // Pull data from chain
    const promotionRpcData = await getPromotion(chainId, provider, promotionId)

    promotions.push(promotionRpcData)
  }

  return { chainId, promotions }
}

// This could be `getPromotions` as a good optimization if we have a lot of promotion data to fetch
// For now let's keep it lightweight and do fetching syncronously until there is a lot of promotions
// and it is a bottleneck
export const getPromotion = async (chainId: number, provider: Provider, promotionId: number) => {
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
