import { PrizeDistributor, Draw } from '@pooltogether/v4-js-client'
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
 * @param prizeDistributor
 * @param draw draw to calculate results for. Assumes this draw is unclaimed.
 * @param disabled
 * @returns
 */
export const useUsersDrawResult = (
  prizeDistributor: PrizeDistributor,
  draw: Draw,
  disabled?: boolean
) => {
  const usersAddress = useUsersAddress()
  const enabled = Boolean(prizeDistributor) && Boolean(usersAddress) && Boolean(draw) && !disabled
  return useQuery(
    ['useUsersDrawResult', prizeDistributor?.id(), usersAddress, draw?.drawId],
    async () => getUsersDrawResult(prizeDistributor, draw, usersAddress),
    { ...NO_REFETCH, enabled }
  )
}

const getUsersDrawResult = async (
  prizeDistributor: PrizeDistributor,
  draw: Draw,
  usersAddress: string
) => {
  const storedResult = getStoredDrawResult(usersAddress, prizeDistributor, draw.drawId)
  if (storedResult) {
    return storedResult.drawResults
  }

  const result = await prizeDistributor.getUsersPrizes(usersAddress, draw)
  // NOTE: Assumes draw is unclaimed.
  setStoredDrawResult(
    usersAddress,
    prizeDistributor,
    draw.drawId,
    result,
    StoredDrawStates.unclaimed
  )
  return result
}
