import { DrawPrize } from '@pooltogether/v4-js-client'
import { getStoredDrawResult } from 'lib/utils/drawResultsStorage'
import { useMemo } from 'react'
import { useUsersAddress } from '../useUsersAddress'

export const useStoredDrawResult = (drawPrize: DrawPrize, drawId: number) => {
  const usersAddress = useUsersAddress()
  return useMemo(() => {
    if (!usersAddress || !drawPrize || !drawId) return null
    const result = getStoredDrawResult(usersAddress, drawPrize, drawId)
    if (!result) return [null, null]
    return [result.state, result.drawResults]
  }, [usersAddress, drawPrize, drawId])
}
