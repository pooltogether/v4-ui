import { usePrizePoolNetwork } from '../PrizePoolNetwork/usePrizePoolNetwork'

export const usePrizePool = (chainId: number, address: string) => {
  const prizePoolNetwork = usePrizePoolNetwork()
  return prizePoolNetwork?.getPrizePool(chainId, address)
}
