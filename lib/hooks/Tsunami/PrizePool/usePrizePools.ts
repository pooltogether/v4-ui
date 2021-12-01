import { usePrizePoolNetwork } from 'lib/hooks/Tsunami/PrizePoolNetwork/usePrizePoolNetwork'

export const usePrizePools = () => {
  const prizePoolNetwork = usePrizePoolNetwork()
  return prizePoolNetwork?.prizePools
}
