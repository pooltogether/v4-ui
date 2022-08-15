import { useSelectedChainId } from '@hooks/useSelectedChainId'
import { useSelectedPrizePoolAddress } from '@hooks/useSelectedPrizePoolAddress'
import { usePrizePool } from './usePrizePool'

export const useSelectedPrizePool = () => {
  const { chainId } = useSelectedChainId()
  const { prizePoolAddress } = useSelectedPrizePoolAddress()
  return usePrizePool(chainId, prizePoolAddress)
}
