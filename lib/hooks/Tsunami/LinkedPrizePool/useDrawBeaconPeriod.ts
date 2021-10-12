import { BigNumber } from '@ethersproject/bignumber'
import { sToMs } from '@pooltogether/utilities'
import { atom, useAtom } from 'jotai'
import { useQuery } from 'react-query'
import { useLinkedPrizePool } from './useLinkedPrizePool'

// Refetch every 5 minutes (the time for the defender)
const refetchIntervalMsAtom = atom<number>(sToMs(60 * 5))

/**
 * // TODO: Rather than polling could we just listen for an event then trigger a refetch?
 * @returns
 */
export const useDrawBeaconPeriod = () => {
  const { data: linkedPrizePool, isFetched } = useLinkedPrizePool()
  const [refetchIntervalMs, setRefetchIntervalMs] = useAtom(refetchIntervalMsAtom)
  const enabled = isFetched

  const onSuccess = (drawBeaconPeriod: {
    startedAtSeconds: BigNumber
    periodSeconds: number
    endsAtSeconds: BigNumber
  }) => {
    const { endsAtSeconds } = drawBeaconPeriod
    let refetchIntervalMs = sToMs(endsAtSeconds.toNumber()) - Date.now()
    console.log('onSuccess', refetchIntervalMs, new Date().toLocaleString())
    // Refetch when the period is done
    if (refetchIntervalMs > 0) {
      setRefetchIntervalMs(refetchIntervalMs)
    } else {
      // Otherwise, refetch every 5 minutes (the time for the defender)
      setRefetchIntervalMs(sToMs(60 * 5))
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
