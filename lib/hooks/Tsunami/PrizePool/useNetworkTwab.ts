import { Network } from 'lib/constants/network'
import { useUsersCurrentPrizePoolTwab } from 'lib/hooks/Tsunami/PrizePool/useUsersCurrentPrizePoolTwab'

import { usePrizePoolByNetwork } from './usePrizePoolByNetwork'

export const useNetworkTwab = (network: Network) => {
  const prizePool = usePrizePoolByNetwork(network)
  return useUsersCurrentPrizePoolTwab(prizePool)
}
