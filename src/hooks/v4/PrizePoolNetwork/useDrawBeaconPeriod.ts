import { BigNumber } from '@ethersproject/bignumber'
import { sToMs } from '@pooltogether/utilities'
import { NO_REFETCH } from '@constants/query'
import { useState } from 'react'
import { useQuery } from 'react-query'
import { useSelectedPrizePool } from '../PrizePool/useSelectedPrizePool'
import { useSelectedPrizeDistributor } from '../PrizeDistributor/useSelectedPrizeDistributor'

/**
 * Often used as a key in other hooks to trigger refetching when the draw ticks over.
 *
 * TODO: Rather than polling could we just listen for an event then trigger a refetch?
 * TODO: Add back refetching when we have a better way of calculating prizes. Currently it takes longer than a draw to compute, so you never actually see the results because the app refetches data after every draw.
 * @returns
 */
export const useDrawBeaconPeriod = () => {
  const prizeDistributor = useSelectedPrizeDistributor()
  const [refetchIntervalMs, setRefetchIntervalMs] = useState(sToMs(60 * 2.5))
  const enabled = !!prizeDistributor

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
      console.log('refetch in ' + refetchIntervalMs + 'ms | ' + Date.now())
      setRefetchIntervalMs(refetchIntervalMs)
    } else {
      // Otherwise, refetch every 2.5 minutes (1/2 the time for the defender cron job)
      console.log('refetch in ' + 60 * 2.5 + 'ms | ' + Date.now())
      setRefetchIntervalMs(sToMs(60 * 2.5))
    }
  }

  return useQuery(
    ['useDrawBeaconPeriod', prizeDistributor?.id()],
    async () => {
      const drawBeaconPeriod = await prizeDistributor.getDrawBeaconPeriod()
      console.log({ id: drawBeaconPeriod.drawId, drawBeaconPeriod })
      return drawBeaconPeriod
    },
    {
      ...NO_REFETCH,
      // refetchInterval: refetchIntervalMs,
      enabled
      // onSuccess
    }
  )
}
