import { useSelectedChainId } from '@hooks/useSelectedChainId'
import { usePrizeDistributorByChainId } from './usePrizeDistributorByChainId'

export const usePrizeDistributorBySelectedChainId = () => {
  const { chainId } = useSelectedChainId()
  return usePrizeDistributorByChainId(chainId)
}
