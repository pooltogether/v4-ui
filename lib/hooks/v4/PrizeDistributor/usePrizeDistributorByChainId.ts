import { usePrizeDistributors } from './usePrizeDistributors'

// NOTE: Assumes only one Prize Distributor per network. This will need to be updated.
export const usePrizeDistributorByChainId = (chainId: number) => {
  const prizeDistributors = usePrizeDistributors()
  return prizeDistributors.find((prizeDistributor) => prizeDistributor.chainId === chainId)
}
