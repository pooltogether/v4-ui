import { usePrizePoolNetwork } from '@hooks/v4/PrizePoolNetwork/usePrizePoolNetwork'

export const usePrizePools = () => {
  const prizePoolNetwork = usePrizePoolNetwork()
  return prizePoolNetwork?.prizePools
}
