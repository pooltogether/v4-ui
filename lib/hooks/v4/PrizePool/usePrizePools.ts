import { usePrizePoolNetwork } from 'lib/hooks/v4/PrizePoolNetwork/usePrizePoolNetwork'

export const usePrizePools = () => {
  const prizePoolNetwork = usePrizePoolNetwork()
  return prizePoolNetwork?.prizePools
}
