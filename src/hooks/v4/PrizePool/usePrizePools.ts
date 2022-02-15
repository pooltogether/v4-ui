import { usePrizePoolNetwork } from '@src/hooks/v4/PrizePoolNetwork/usePrizePoolNetwork'

export const usePrizePools = () => {
  const prizePoolNetwork = usePrizePoolNetwork()
  return prizePoolNetwork?.prizePools
}
