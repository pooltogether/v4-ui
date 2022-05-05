import { BigNumber } from '@ethersproject/bignumber'
import { sToMs } from '@pooltogether/utilities'
import { NO_REFETCH } from '@constants/query'
import { useState } from 'react'
import { useQuery } from 'react-query'
import { useSelectedPrizePool } from '../PrizePool/useSelectedPrizePool'

/**
 * Often used as a key in other hooks to trigger refetching when the draw ticks over.
 *
 * TODO: Rather than polling could we just listen for an event then trigger a refetch?
 * @returns
 */
export const useDrawBeaconPeriod = () => {
  const prizePool = useSelectedPrizePool()
  const [refetchIntervalMs, setRefetchIntervalMs] = useState(sToMs(60 * 2.5))
  const enabled = !!prizePool

  const onSuccess = (drawBeaconPeriod: {
    startedAtSeconds: BigNumber
    periodSeconds: number
    endsAtSeconds: BigNumber
    drawId: number
  }) => {
    const { endsAtSeconds } = drawBeaconPeriod
    let refetchIntervalMs = sToMs(endsAtSeconds.toNumber()) - Date.now()
    // Refetch when the period is done
    if (refetchIntervalMs > 0) {
      setRefetchIntervalMs(refetchIntervalMs)
    } else {
      // Otherwise, refetch every 2.5 minutes (1/2 the time for the defender cron job)
      setRefetchIntervalMs(sToMs(60 * 2.5))
    }
  }

  return useQuery(
    ['useDrawBeaconPeriod', prizePool?.id()],
    async () => {
      const drawBeaconPeriod = await prizePool.getDrawBeaconPeriod()
      return drawBeaconPeriod
    },
    {
      ...NO_REFETCH,
      refetchInterval: refetchIntervalMs,
      enabled,
      onSuccess
    }
  )
}
