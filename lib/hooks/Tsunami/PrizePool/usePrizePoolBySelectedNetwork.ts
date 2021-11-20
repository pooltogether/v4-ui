import { useSelectedNetwork } from 'lib/hooks/useSelectedNetwork'
import { usePrizePoolByChainId } from './usePrizePoolByChainId'

export const usePrizePoolBySelectedNetwork = () => {
  const { chainId } = useSelectedNetwork()
  return usePrizePoolByChainId(chainId)
}
