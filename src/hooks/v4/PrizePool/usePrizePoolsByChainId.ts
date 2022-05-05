import { usePrizePools } from './usePrizePools'

export const usePrizePoolsByChainId = (chainId: number) => {
  const prizePools = usePrizePools()
  return prizePools.filter((prizePool) => prizePool.chainId === chainId)
}
