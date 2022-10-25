import { usePrizePools } from './usePrizePools'

export const usePrizePool = (chainId: number, address: string) => {
  const prizePools = usePrizePools()
  return prizePools.find((prizePool) => {
    return (
      prizePool.chainId === chainId && prizePool.address.toLowerCase() === address.toLowerCase()
    )
  })
}
