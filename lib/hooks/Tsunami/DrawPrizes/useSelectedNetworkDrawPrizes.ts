import { useNetworkDrawPrizes } from 'lib/hooks/Tsunami/DrawPrizes/useNetworkDrawPrizes'
import { useSelectedNetwork } from 'lib/hooks/useSelectedNetwork'

export const useSelectedNetworkDrawPrizes = () => {
  const [chainId] = useSelectedNetwork()
  return useNetworkDrawPrizes(chainId)
}
