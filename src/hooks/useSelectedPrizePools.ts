import { useSelectedChainId } from './useSelectedChainId'
import { usePrizePoolsByChainId } from './v4/PrizePool/usePrizePoolsByChainId'

export const useSelectedPrizePools = () => {
  const { chainId } = useSelectedChainId()
  return usePrizePoolsByChainId(chainId)
}
