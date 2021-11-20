import { useEnvPrizePoolAddresses } from 'lib/hooks/Tsunami/PrizePool/useEnvPrizePoolAddresses'
import { usePrizePool } from './usePrizePool'

export const usePrizePoolByChainId = (chainId: number) => {
  const prizePoolAddresses = useEnvPrizePoolAddresses()
  return usePrizePool(chainId, prizePoolAddresses[chainId])
}
