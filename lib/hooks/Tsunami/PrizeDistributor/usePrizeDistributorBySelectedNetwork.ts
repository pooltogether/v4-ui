import { useSelectedNetwork } from 'lib/hooks/useSelectedNetwork'
import { usePrizeDistributorByChainId } from './usePrizeDistributorByChainId'

export const usePrizeDistributorBySelectedNetwork = () => {
  const { chainId } = useSelectedNetwork()
  return usePrizeDistributorByChainId(chainId)
}
