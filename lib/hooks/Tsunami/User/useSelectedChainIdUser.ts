import { useSelectedChainId } from 'lib/hooks/useSelectedChainId'
import { usePrizePoolByChainId } from '../PrizePool/usePrizePoolByChainId'
import { useUser } from './useUser'

export const useSelectedChainIdUser = () => {
  const { chainId } = useSelectedChainId()
  const prizePool = usePrizePoolByChainId(chainId)
  return useUser(prizePool)
}
