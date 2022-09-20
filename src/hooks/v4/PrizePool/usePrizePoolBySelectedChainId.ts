import { useSelectedChainId } from '@hooks/useSelectedChainId'
import { usePrizePoolByChainId } from './usePrizePoolByChainId'

export const usePrizePoolBySelectedChainId = () => {
  const { chainId } = useSelectedChainId()
  console.log('usePrizePoolBySelectedChainId', { chainId })

  return usePrizePoolByChainId(chainId)
}
