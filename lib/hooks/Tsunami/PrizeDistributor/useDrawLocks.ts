import { PrizeDistributor } from '.yalc/@pooltogether/v4-js-client/dist'
import { BigNumber } from 'ethers'
import { NO_REFETCH } from 'lib/constants/queryKeys'
import { useQuery } from 'react-query'
import { useDrawBeaconPeriod } from '../LinkedPrizePool/useDrawBeaconPeriod'
import { usePrizeDistributors } from './usePrizeDistributors'

export interface DrawLock {
  startTimeSeconds: BigNumber
  endTimeSeconds: BigNumber
  durationSeconds: number
}

export interface DrawLocks {
  [drawId: number]: DrawLock
}

/**
 * Fetches all of the locked draws, returns the latest ending time for each draw id and an amount of time until the next time we need to refetch
 * @returns
 */
export const useDrawLocks = () => {
  const { data: prizeDistributors, isFetched } = usePrizeDistributors()
  const { data: drawBeaconPeriod, isFetched: isDrawBeaconFetched } = useDrawBeaconPeriod()
  const enabled = Boolean(prizeDistributors) && isFetched && isDrawBeaconFetched
  return useQuery(
    ['useDrawUnlockTime', drawBeaconPeriod?.startedAtSeconds.toString()],
    () => getDrawLocks(prizeDistributors),
    {
      ...NO_REFETCH,
      enabled
    }
  )
}

const getDrawLocks = async (prizeDistributors: PrizeDistributor[]): Promise<DrawLocks> => {
  console.log('Fetching unlock time')
  const lockedDraws = await Promise.all(
    prizeDistributors.map((prizeDistributor) => prizeDistributor.getTimelockDrawId())
  )

  const drawLocks: DrawLocks = {}

  lockedDraws.forEach((lockedDraw) => {
    const drawLockForDrawId = drawLocks[lockedDraw.drawId]
    if (!drawLockForDrawId) {
      drawLocks[lockedDraw.drawId] = getFullDrawLock(
        lockedDraw.lockStartTimeSeconds,
        lockedDraw.timelockDurationSeconds
      )
    } else if (drawLockForDrawId.startTimeSeconds.lt(lockedDraw.lockStartTimeSeconds)) {
      drawLocks[lockedDraw.drawId] = getFullDrawLock(
        lockedDraw.lockStartTimeSeconds,
        lockedDraw.timelockDurationSeconds
      )
    }
  })

  console.log(new Date().toUTCString(), Date.now(), drawLocks)

  return drawLocks
}

const getFullDrawLock = (startTimeSeconds: BigNumber, durationSeconds: number): DrawLock => {
  const endTimeSeconds = startTimeSeconds.add(durationSeconds).add(1)

  return {
    startTimeSeconds,
    endTimeSeconds,
    durationSeconds
  }
}
