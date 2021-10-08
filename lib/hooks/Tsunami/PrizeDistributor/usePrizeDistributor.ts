import { usePrizeDistributors } from 'lib/hooks/Tsunami/PrizeDistributor/usePrizeDistributors'
import { useMemo } from 'react'

export const usePrizeDistributor = (chainId: number, address: string) => {
  const { data: prizeDistributors } = usePrizeDistributors()
  return useMemo(() => {
    if (!prizeDistributors) return null
    const prizeDistributor = prizeDistributors.find(
      (prizeDistributor) =>
        prizeDistributor.chainId === chainId && prizeDistributor.address === address
    )
    if (!prizeDistributor) return null
    return prizeDistributor
  }, [prizeDistributors])
}
