import { sToMs } from '@pooltogether/utilities'
import { PrizeDistributor } from '@pooltogether/v4-client-js'
import { useState } from 'react'
import { useQuery } from 'react-query'
import { getDrawLock, getDrawLocksQueryKey, handleSettingDrawLockRefetch } from './useAllDrawLocks'
import { useDrawBeaconPeriod } from '../PrizePoolNetwork/useDrawBeaconPeriod'

/**
 * Fetches all of the draws stored in the drawcalculator timelocks and checks if they're still locked. Refetches when they're unlocked and polls every 2.5 minutes to check if htey're updated.
 * @returns
 */
export const useDrawLocks = (prizeDistributor: PrizeDistributor) => {
  const { data: drawBeaconPeriod, isFetched: isDrawBeaconFetched } = useDrawBeaconPeriod()
  const [refetchIntervals, setRefetchIntervals] = useState<{
    [prizeDistributorId: string]: number
  }>({})

  return useQuery(
    getDrawLocksQueryKey(prizeDistributor, drawBeaconPeriod),
    () => getDrawLock(prizeDistributor),
    {
      enabled: !!prizeDistributor && isDrawBeaconFetched,
      refetchInterval: refetchIntervals[prizeDistributor.id()] || sToMs(60 * 2.5),
      onSuccess: (data) => handleSettingDrawLockRefetch(data, setRefetchIntervals)
    }
  )
}
