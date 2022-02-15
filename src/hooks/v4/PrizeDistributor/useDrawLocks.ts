import { PrizeDistributor } from '@pooltogether/v4-js-client'
import { sToMs } from '@pooltogether/utilities'
import { BigNumber } from 'ethers'
import { useQuery } from 'react-query'

import { useDrawBeaconPeriod } from '../PrizePoolNetwork/useDrawBeaconPeriod'
import { usePrizeDistributors } from './usePrizeDistributors'
import { NO_REFETCH } from '@src/constants/query'

export interface DrawLock {
  endTimeSeconds: BigNumber
}

/**
 * Fetches all of the locked draws, returns the latest ending time for each draw id and an amount of time until the next time we need to refetch
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
      ...NO_REFETCH,
      refetchInterval: sToMs(60 * 5),
      enabled
    }
  )
}

const getDrawLocks = async (
  prizeDistributors: PrizeDistributor[]
): Promise<{
  [drawId: number]: DrawLock
}> => {
  const lockedDraws = await Promise.all(
    prizeDistributors.map((prizeDistributor) => prizeDistributor.getTimelockDrawId())
  )

  const drawLocks: {
    [drawId: number]: DrawLock
  } = {}

  lockedDraws.forEach((lockedDraw) => {
    const drawLockForDrawId = drawLocks[lockedDraw.drawId]
    if (!drawLockForDrawId) {
      drawLocks[lockedDraw.drawId] = {
        endTimeSeconds: lockedDraw.endTimeSeconds.add(1)
      }
    } else if (drawLockForDrawId.endTimeSeconds.lt(lockedDraw.endTimeSeconds)) {
      drawLocks[lockedDraw.drawId] = {
        endTimeSeconds: lockedDraw.endTimeSeconds.add(1)
      }
    }
  })

  return drawLocks
}
