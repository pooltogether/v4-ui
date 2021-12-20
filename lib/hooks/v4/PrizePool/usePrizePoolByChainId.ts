import { useEnvPrizePoolAddresses } from 'lib/hooks/v4/PrizePool/useEnvPrizePoolAddresses'
import { usePrizePool } from './usePrizePool'

export const usePrizePoolByChainId = (chainId: number) => {
  const prizePoolAddresses = useEnvPrizePoolAddresses()
  return usePrizePool(chainId, prizePoolAddresses[chainId])
}
