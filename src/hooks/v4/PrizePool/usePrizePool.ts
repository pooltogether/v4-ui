import { usePrizePools } from './usePrizePools'

export const usePrizePool = (chainId: number, address: string) => {
  const prizePools = usePrizePools()
  return prizePools.find(
    (prizePool) => prizePool.chainId === chainId && prizePool.address === address
  )
}
