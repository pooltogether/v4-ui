import { BigNumber } from '@ethersproject/bignumber'
import { sToMs } from '@pooltogether/utilities'
import { NO_REFETCH } from 'lib/constants/queryKeys'
import { useState } from 'react'
import { useQuery } from 'react-query'
import { useLinkedPrizePool } from './useLinkedPrizePool'

/**
 *
 * @returns
 */
export const useDrawBeaconPeriod = () => {
  const { data: linkedPrizePool, isFetched } = useLinkedPrizePool()
  const [refetchIntervalMs, setRefetchIntervalMs] = useState<number | false>(false)
  const enabled = isFetched

  const onSuccess = (drawBeaconPeriod: {
    startedAtSeconds: BigNumber
    periodSeconds: number
    endsAtSeconds: BigNumber
  }) => {
    const { endsAtSeconds } = drawBeaconPeriod
    let refetchIntervalMs = sToMs(endsAtSeconds.toNumber()) - Date.now()
    console.log('onSuccess', refetchIntervalMs)
    // Refetch when the period is done
    if (refetchIntervalMs > 0) {
      setRefetchIntervalMs(refetchIntervalMs)
    } else {
      // Otherwise, refetch every 15 seconds
      setRefetchIntervalMs(sToMs(15))
    }
  }

  const getDrawBeaconPeriod = async () => {
    const a = await linkedPrizePool.getDrawBeaconPeriod()
    console.log('getDrawBeaconPeriod', a)
    return a
  }

  return useQuery(['useDrawBeaconPeriod'], getDrawBeaconPeriod, {
    ...NO_REFETCH,
    enabled,
    refetchInterval: refetchIntervalMs,
    onSuccess
  })
}
