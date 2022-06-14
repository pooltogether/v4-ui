import { NO_REFETCH } from '@constants/query'
import { sToMs } from '@pooltogether/utilities'
import { useState } from 'react'
import { useQueries } from 'react-query'
import {
  getDrawBeaconPeriod,
  getDrawBeaconPeriodQueryKey,
  onDrawBeaconPeriodFetchSuccess
} from './useDrawBeaconPeriod'
import { usePrizeDistributors } from './usePrizeDistributors'

export const useAllDrawBeaconPeriods = () => {
  const prizeDistributors = usePrizeDistributors()
  const [refetchIntervalsMs, setRefetchIntervalsMs] = useState({})

  return useQueries(
    prizeDistributors.map((prizeDistributor) => ({
      ...NO_REFETCH,
      queryKey: getDrawBeaconPeriodQueryKey(prizeDistributor),
      queryFn: async () => getDrawBeaconPeriod(prizeDistributor),
      onSuccess: (data) =>
        onDrawBeaconPeriodFetchSuccess(data.drawBeaconPeriod, (ms) => {
          setRefetchIntervalsMs((refetchIntervalsMs) => {
            const newRefetchIntervalsMs = { ...refetchIntervalsMs }
            newRefetchIntervalsMs[prizeDistributor.id()] = ms
            return newRefetchIntervalsMs
          })
        }),
      refetchInterval: refetchIntervalsMs[prizeDistributor.id()] || sToMs(60 * 2.5)
    }))
  )
}
