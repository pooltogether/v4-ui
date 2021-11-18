import { useSelectedNetwork } from 'lib/hooks/useSelectedNetwork'
import { usePrizePoolByChainId } from '../PrizePool/usePrizePoolByChainId'
import { usePlayer } from './usePlayer'

export const useSelectedNetworkPlayer = () => {
  const { chainId } = useSelectedNetwork()
  const prizePool = usePrizePoolByChainId(chainId)
  return usePlayer(prizePool)
}
