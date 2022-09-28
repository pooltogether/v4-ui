import { useAllChainsFilteredPromotions } from '@hooks/v4/TwabRewards/useAllChainsFilteredPromotions'
import { getPromotionDaysRemaining } from '@utils/v4/TwabRewards/promotionHooks'

export const useChainActiveRewards = () => {
  const queryResults = useAllChainsFilteredPromotions()

  const isFetched = queryResults.every((queryResult) => queryResult.isFetched)
  const isError = queryResults.some((queryResult) => queryResult.isError)

  let data = { queryResults, chains: {}, activeCount: 0 }
  queryResults?.forEach((queryResult) => {
    const chainId = queryResult.data?.chainId
    data.chains[chainId] = 0

    queryResult.data?.promotions?.forEach((promotion) => {
      const daysRemaining = getPromotionDaysRemaining(promotion)

      if (daysRemaining > 0) {
        data.chains[chainId] += 1
        data.activeCount += 1
      }
    })
  })

  return { data, isFetched, isError }
}
