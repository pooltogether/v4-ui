import { usePrizePools } from './usePrizePools'

// NOTE: Assumes there is only one Prize Pool per network. This will need to be reworked eventually.
export const usePrizePoolByChainId = (chainId: number) => {
  const prizePools = usePrizePools()
  return prizePools.find((prizePool) => prizePool.chainId === chainId)
}
