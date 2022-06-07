import { usePrizePoolNetwork } from '../PrizePoolNetwork/usePrizePoolNetwork'

export const usePrizeDistributors = () => {
  const prizePoolNetwork = usePrizePoolNetwork()
  return prizePoolNetwork?.v2PrizeDistributors
}
