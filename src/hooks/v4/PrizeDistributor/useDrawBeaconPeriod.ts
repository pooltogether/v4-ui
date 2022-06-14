import { BigNumber } from '@ethersproject/bignumber'
import { sToMs } from '@pooltogether/utilities'
import { NO_REFETCH } from '@constants/query'
import { useState } from 'react'
import { useQuery } from 'react-query'
import { PrizeDistributorV2 } from '@pooltogether/v4-client-js'

/**
 * Often used as a key in other hooks to trigger refetching when the draw ticks over.
 *
 * TODO: Rather than polling could we just listen for an event then trigger a refetch?
 * @returns
 */
export const useDrawBeaconPeriod = (prizeDistributor: PrizeDistributorV2) => {
  const [refetchIntervalMs, setRefetchIntervalMs] = useState(sToMs(60 * 2.5))
  const enabled = !!prizeDistributor

  return useQuery(
    getDrawBeaconPeriodQueryKey(prizeDistributor),
    async () => getDrawBeaconPeriod(prizeDistributor),
    {
      ...NO_REFETCH,
      refetchInterval: refetchIntervalMs,
      enabled,
      onSuccess: (result) =>
        onDrawBeaconPeriodFetchSuccess(result.drawBeaconPeriod, setRefetchIntervalMs)
    }
  )
}

export const getDrawBeaconPeriodQueryKey = (prizeDistributor: PrizeDistributorV2) => [
  'useDrawBeaconPeriod',
  prizeDistributor?.id()
]

export const getDrawBeaconPeriod = async (prizeDistributor: PrizeDistributorV2) => {
  const drawBeaconPeriod = await prizeDistributor.getDrawBeaconPeriod()
  return {
    prizeDistributorId: prizeDistributor.id(),
    drawBeaconPeriod
  }
}

export const onDrawBeaconPeriodFetchSuccess = (
  drawBeaconPeriod: {
    startedAtSeconds: BigNumber
    periodSeconds: number
    endsAtSeconds: BigNumber
    drawId: number
  },
  setRefetchIntervalMs: (ms: number) => void
) => {
  const { endsAtSeconds } = drawBeaconPeriod
  let refetchIntervalMs = sToMs(endsAtSeconds.toNumber()) - Date.now()
  // Refetch when the period is done
  if (refetchIntervalMs > 0) {
    console.log('refetch in ' + refetchIntervalMs + 'ms | ' + Date.now())
    setRefetchIntervalMs(refetchIntervalMs)
  } else {
    // Otherwise, refetch every 2.5 minutes (1/2 the time for the defender cron job)
    console.log('refetch in ' + 60 * 2.5 + 'ms | ' + Date.now())
    setRefetchIntervalMs(sToMs(60 * 2.5))
  }
}
