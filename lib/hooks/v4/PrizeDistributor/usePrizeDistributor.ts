import { usePrizePoolNetwork } from '../PrizePoolNetwork/usePrizePoolNetwork'

export const usePrizeDistributor = (chainId: number, address: string) => {
  const prizePoolNetwork = usePrizePoolNetwork()
  return prizePoolNetwork?.getPrizeDistributor(chainId, address)
}
