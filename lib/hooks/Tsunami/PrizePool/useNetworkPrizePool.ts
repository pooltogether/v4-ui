import { useEnvPrizePoolAddresses } from 'lib/hooks/Tsunami/PrizePool/useEnvPrizePoolAddresses'
import { usePrizePool } from './usePrizePool'

export const useNetworkPrizePool = (chainId: number) => {
  const prizePoolAddresses = useEnvPrizePoolAddresses()
  return usePrizePool(prizePoolAddresses[chainId], chainId)
}
