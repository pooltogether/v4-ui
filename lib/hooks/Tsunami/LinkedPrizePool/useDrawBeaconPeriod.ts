import { BigNumber } from '@ethersproject/bignumber'
import { sToMs } from '@pooltogether/utilities'
import { useState } from 'react'
import { useQuery } from 'react-query'
import { useLinkedPrizePool } from './useLinkedPrizePool'

/**
 * // TODO: Rather than polling could we just listen for an event then trigger a refetch?
 * @returns
 */
export const useDrawBeaconPeriod = () => {
  const { data: linkedPrizePool, isFetched } = useLinkedPrizePool()
  const [refetchIntervalMs, setRefetchIntervalMs] = useState(sToMs(60 * 2.5))
  const enabled = isFetched

  const onSuccess = (drawBeaconPeriod: {
    startedAtSeconds: BigNumber
    periodSeconds: number
    endsAtSeconds: BigNumber
    drawId: number
  }) => {
    const { endsAtSeconds } = drawBeaconPeriod
    let refetchIntervalMs = sToMs(endsAtSeconds.toNumber()) - Date.now()
    console.log('onSuccess', refetchIntervalMs, new Date().toLocaleString())
    // Refetch when the period is done
    if (refetchIntervalMs > 0) {
      setRefetchIntervalMs(refetchIntervalMs)
    } else {
      // Otherwise, refetch every 2.5 minutes (1/2 the time for the defender cron job)
      setRefetchIntervalMs(sToMs(60 * 2.5))
    }
  }

  const getDrawBeaconPeriod = async () => {
    const a = await linkedPrizePool.getDrawBeaconPeriod()
    console.log('getDrawBeaconPeriod', a, new Date().toLocaleString())
    return a
  }

  return useQuery(['useDrawBeaconPeriod'], getDrawBeaconPeriod, {
    enabled,
    refetchInterval: refetchIntervalMs,
    onSuccess
  })
}
