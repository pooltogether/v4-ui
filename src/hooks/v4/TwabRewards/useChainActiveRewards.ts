import { UseQueryResult } from 'react-query'
import { Promotion } from '@interfaces/promotions'
import { getPromotionDaysRemaining } from '@utils/v4/TwabRewards/promotionHooks'
import { useAllChainsFilteredPromotions } from '@hooks/v4/TwabRewards/useAllChainsFilteredPromotions'

export const useChainActiveRewards = (): {
  data: {
    queryResults: UseQueryResult<{ chainId: any; promotions: Array<Promotion> }>
    chains: { string?: number }
    activeCount: number
  }
  isFetched: boolean
  isError: boolean
} => {
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
