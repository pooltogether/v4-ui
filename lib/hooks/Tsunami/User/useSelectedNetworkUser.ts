import { useSelectedNetwork } from 'lib/hooks/useSelectedNetwork'
import { usePrizePoolByChainId } from '../PrizePool/usePrizePoolByChainId'
import { useUser } from './useUser'

export const useSelectedNetworkUser = () => {
  const { chainId } = useSelectedNetwork()
  const prizePool = usePrizePoolByChainId(chainId)
  return useUser(prizePool)
}
