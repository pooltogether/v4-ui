import { PrizeDistributor } from '@pooltogether/v4-client-js'
import { getStoredDrawResult } from '@utils/drawResultsStorage'
import { useMemo } from 'react'
import { useUsersAddress } from '../useUsersAddress'

export const useStoredDrawResult = (prizeDistributor: PrizeDistributor, drawId: number) => {
  const usersAddress = useUsersAddress()
  return useMemo(() => {
    if (!usersAddress || !prizeDistributor || !drawId) return null
    const result = getStoredDrawResult(usersAddress, prizeDistributor, drawId)
    if (!result) return [null, null]
    return [result.state, result.drawResults]
  }, [usersAddress, prizeDistributor, drawId])
}
