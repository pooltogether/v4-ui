import { usePrizeDistributors } from 'lib/hooks/Tsunami/PrizeDistributor/usePrizeDistributors'
import { useMemo } from 'react'

export const useNetworkPrizeDistributors = (chainId: number) => {
  const { data, ...useQueryResults } = usePrizeDistributors()
  const filteredPrizeDistributors = useMemo(
    () => data?.filter((prizeDistributor) => prizeDistributor.chainId === chainId),
    [data, chainId]
  )

  return {
    data: filteredPrizeDistributors,
    ...useQueryResults
  }
}
