import { useNetworkClaimableDraws } from 'lib/hooks/Tsunami/ClaimableDraws/useNetworkClaimableDraws'
import { useSelectedNetwork } from 'lib/hooks/useSelectedNetwork'

export const useSelectedNetworkClaimableDraws = () => {
  const [chainId] = useSelectedNetwork()
  return useNetworkClaimableDraws(chainId)
}
