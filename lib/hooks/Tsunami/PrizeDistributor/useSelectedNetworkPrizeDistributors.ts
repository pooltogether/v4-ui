import { useNetworkPrizeDistributors } from 'lib/hooks/Tsunami/PrizeDistributor/useNetworkPrizeDistributors'
import { useSelectedNetwork } from 'lib/hooks/useSelectedNetwork'

export const useSelectedNetworkPrizeDistributors = () => {
  const [chainId] = useSelectedNetwork()
  return useNetworkPrizeDistributors(chainId)
}
