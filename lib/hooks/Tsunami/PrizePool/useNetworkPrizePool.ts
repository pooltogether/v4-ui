import { useEnvPrizePoolAddresses } from 'lib/hooks/useEnvPrizePoolAddresses'
import { usePrizePool } from './usePrizePool'

export const useNetworkPrizePool = (chainId: number) => {
  const prizePoolAddresses = useEnvPrizePoolAddresses()
  console.log(prizePoolAddresses)
  return usePrizePool(prizePoolAddresses[chainId], chainId)
}
