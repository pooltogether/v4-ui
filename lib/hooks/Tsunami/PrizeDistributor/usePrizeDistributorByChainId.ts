import { useEnvPrizeDistributorAddresses } from './useEnvPrizeDistributorAddresses'
import { usePrizeDistributor } from './usePrizeDistributor'

export const usePrizeDistributorByChainId = (chainId: number) => {
  const prizeDistributorAddresses = useEnvPrizeDistributorAddresses()
  return usePrizeDistributor(chainId, prizeDistributorAddresses[chainId])
}
