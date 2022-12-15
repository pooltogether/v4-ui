import { PrizeDistributor, PrizePool } from '@pooltogether/v4-client-js'
import { useQuery } from 'react-query'
import { usePrizeDistributorByChainId } from '../PrizeDistributor/usePrizeDistributorByChainId'
import { useDrawBeaconPeriod } from '../PrizePoolNetwork/useDrawBeaconPeriod'

export const getUpcomingPrizeTierKey = (
  drawBeaconPeriodDrawId: number,
  prizeDistributorId: string
) => ['useUpcomingPrizeTier', drawBeaconPeriodDrawId, prizeDistributorId]

/**
 * NOTE: Assumes 1 PrizeDistributor per chain
 * @param prizePool
 * @returns
 */
export const useUpcomingPrizeTier = (prizePool: PrizePool) => {
  const prizeDistributor = usePrizeDistributorByChainId(prizePool?.chainId)
  const { data: drawBeaconPeriod, isFetched } = useDrawBeaconPeriod()
  return useQuery(
    getUpcomingPrizeTierKey(drawBeaconPeriod?.drawId, prizeDistributor?.id()),
    () => getUpcomingPrizeTier(prizeDistributor),
    {
      enabled: isFetched && !!prizeDistributor
    }
  )
}

export const getUpcomingPrizeTier = async (prizeDistributor: PrizeDistributor) => {
  const prizeTier = await prizeDistributor.getUpcomingPrizeTier()
  return {
    prizeTier,
    prizeDistributorId: prizeDistributor.id()
  }
}
