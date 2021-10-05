import { DrawPrize, Draw } from '@pooltogether/v4-js-client'
import { NO_REFETCH } from 'lib/constants/queryKeys'
import { useUsersAddress } from 'lib/hooks/useUsersAddress'
import {
  StoredDrawStates,
  getStoredDrawResult,
  setStoredDrawResult
} from 'lib/utils/drawResultsStorage'
import { useQuery } from 'react-query'

// TODO: Optimize this rather than calling for each draw on render

/**
 *
 * @param drawPrize
 * @param draw draw to calculate results for. Assumes this draw is unclaimed.
 * @param disabled
 * @returns
 */
export const useUsersDrawResult = (drawPrize: DrawPrize, draw: Draw, disabled?: boolean) => {
  const usersAddress = useUsersAddress()
  const enabled = Boolean(drawPrize) && Boolean(usersAddress) && Boolean(draw) && !disabled
  return useQuery(
    ['useUsersDrawResult', drawPrize?.id(), usersAddress, draw?.drawId],
    async () => getUsersDrawResult(drawPrize, draw, usersAddress),
    { ...NO_REFETCH, enabled }
  )
}

const getUsersDrawResult = async (drawPrize: DrawPrize, draw: Draw, usersAddress: string) => {
  const storedResult = getStoredDrawResult(usersAddress, drawPrize, draw.drawId)
  if (storedResult) {
    return storedResult.drawResults
  }

  const result = await drawPrize.getUsersPrizes(usersAddress, draw)
  // NOTE: Assumes draw is unclaimed.
  setStoredDrawResult(usersAddress, drawPrize, draw.drawId, result, StoredDrawStates.unclaimed)
  return result
}
