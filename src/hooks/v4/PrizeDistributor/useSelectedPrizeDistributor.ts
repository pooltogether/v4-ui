import { useSelectedChainId } from '@hooks/useSelectedChainId'

import { usePrizeDistributorByChainId } from './usePrizeDistributorByChainId'

export const useSelectedPrizeDistributor = () => {
  const { chainId } = useSelectedChainId()
  return usePrizeDistributorByChainId(chainId)
}
