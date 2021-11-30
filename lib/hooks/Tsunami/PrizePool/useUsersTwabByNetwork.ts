import { Network } from 'lib/constants/config'
import { useUsersCurrentPrizePoolTwab } from 'lib/hooks/Tsunami/PrizePool/useUsersCurrentPrizePoolTwab'

import { usePrizePoolByNetwork } from './usePrizePoolByNetwork'

export const useUsersTwabByNetwork = (usersAddress: string, network: Network) => {
  const prizePool = usePrizePoolByNetwork(network)
  return useUsersCurrentPrizePoolTwab(usersAddress, prizePool)
}
