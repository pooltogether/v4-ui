import { usePrizeDistributors } from 'lib/hooks/Tsunami/PrizeDistributor/usePrizeDistributors'

export const useNetworkPrizeDistributors = (chainId: number) => {
  const prizeDistributors = usePrizeDistributors()
  return prizeDistributors?.filter((prizeDistributor) => prizeDistributor.chainId === chainId)
}
