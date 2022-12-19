import { sToMs } from '@pooltogether/utilities'
import { PrizeDistributor } from '@pooltogether/v4-client-js'
import { BigNumber } from 'ethers'
import { useQuery } from 'react-query'
import { useDrawBeaconPeriod } from '../PrizePoolNetwork/useDrawBeaconPeriod'
import { usePrizeDistributors } from './usePrizeDistributors'

/**
 * Fetches all of the locked draws, returns the latest ending time for each draw id, an amount of time until the next time we need to refetch and the chain ids that it is locked on.
 * @returns
 */
export const useDrawLocks = () => {
  const prizeDistributors = usePrizeDistributors()
  const { data: drawBeaconPeriod, isFetched: isDrawBeaconFetched } = useDrawBeaconPeriod()
  const enabled = Boolean(prizeDistributors) && isDrawBeaconFetched
  return useQuery(
    [
      'useDrawUnlockTime',
      drawBeaconPeriod?.startedAtSeconds.toString(),
      prizeDistributors?.map((pd) => pd.id())
    ],
    () => getDrawLocks(prizeDistributors),
    {
      refetchInterval: sToMs(60 * 5),
      enabled
    }
  )
}

const getDrawLocks = async (
  prizeDistributors: PrizeDistributor[]
): Promise<
  {
    drawId: number
    endTimeSeconds: BigNumber
    prizeDistributorId: string
  }[]
> => {
  const lockedDraws = await Promise.all(
    prizeDistributors.map(async (prizeDistributor) => {
      const result = await prizeDistributor.getTimelockDrawId()
      return {
        prizeDistributorId: prizeDistributor.id(),
        endTimeSeconds: result.endTimeSeconds.add(1),
        drawId: result.drawId
      }
    })
  )

  return lockedDraws
}
