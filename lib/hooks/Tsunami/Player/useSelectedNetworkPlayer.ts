import { useSelectedNetwork } from 'lib/hooks/useSelectedNetwork'
import { useNetworkPrizePool } from '../PrizePool/useNetworkPrizePool'
import { usePlayer } from './usePlayer'

export const useSelectedNetworkPlayer = () => {
  const chainId = useSelectedNetwork()
  const { data: prizePool } = useNetworkPrizePool(chainId)
  return usePlayer(prizePool)
}
