import { useSelectedChainId } from 'lib/hooks/useSelectedChainId'
import { usePrizePoolByChainId } from './usePrizePoolByChainId'

export const usePrizePoolBySelectedChainId = () => {
  const { chainId } = useSelectedChainId()
  return usePrizePoolByChainId(chainId)
}
