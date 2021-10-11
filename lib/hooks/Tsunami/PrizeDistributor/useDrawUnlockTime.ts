import { PrizeDistributor } from '.yalc/@pooltogether/v4-js-client/dist'
import { BigNumber, ethers } from 'ethers'
import { NO_REFETCH } from 'lib/constants/queryKeys'
import { useState } from 'react'
import { useQuery } from 'react-query'
import { usePrizeDistributors } from './usePrizeDistributors'

export const useDrawUnlockTime = () => {
  const { data: prizeDistributors, isFetched } = usePrizeDistributors()
  const [refetchIntervalMs, setRefetchIntervalMs] = useState<number>()
  const enabled = Boolean(prizeDistributors) && isFetched
  return useQuery(['useDrawUnlockTime'], () => getDrawUnlockTime(prizeDistributors), {
    ...NO_REFETCH,
    enabled,
    refetchInterval: refetchIntervalMs,
    onSuccess: (unlockTimeS: BigNumber) => {
      const unlockTimeMs = unlockTimeS.toNumber() * 1000
      const currentTimeMs = Date.now()
      console.log(unlockTimeMs, currentTimeMs, unlockTimeMs - currentTimeMs)
      setRefetchIntervalMs(unlockTimeMs - currentTimeMs)
    }
  })
}

const getDrawUnlockTime = async (prizeDistributors: PrizeDistributor[]): Promise<BigNumber> => {
  const lockedDraws = await Promise.all(
    prizeDistributors.map((prizeDistributor) => prizeDistributor.getLockedDrawId())
  )
  const latestStartTime = lockedDraws
    .map((lockedDraw) => lockedDraw.lockStartTimeSeconds)
    .reduce((prev, next) => (prev.gt(next) ? prev : next), ethers.constants.Zero)
  const timelockDuration = ethers.BigNumber.from(lockedDraws[0].timelockDurationSeconds)
  // Start time, plus duration plus a 1 second buffer
  return latestStartTime.add(timelockDuration).add(1)
}
