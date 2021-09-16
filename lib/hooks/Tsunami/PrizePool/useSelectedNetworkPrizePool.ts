import { useSelectedNetwork } from 'lib/hooks/useSelectedNetwork'
import { useNetworkPrizePool } from './useNetworkPrizePool'

export const useSelectedNetworkPrizePool = () => {
  const [chainId] = useSelectedNetwork()
  return useNetworkPrizePool(chainId)
}
