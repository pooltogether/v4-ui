import { deserializeBigNumbers } from '@pooltogether/utilities'
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

  // console.log('TEST', 'base path', window.location.origin)
  // const url = new URL('/.netlify/functions/users-prizes', window.location.origin)
  // url.searchParams.set('usersAddress', usersAddress)
  // url.searchParams.set('chainId', String(prizeDistributor.chainId))
  // url.searchParams.set('prizeDistributorAddress', prizeDistributor.address)
  // url.searchParams.set('drawId', String(draw.drawId))

  // console.log('TEST', 'Fetching', url)
  // const response = await fetch(url.toString())
  // console.log('TEST', 'Response', response)
  // let drawResults = await response.json()
  // drawResults = deserializeBigNumbers(drawResults)
  // console.log('TEST', 'Result', drawResults)

  const drawResults = await prizeDistributor.getUsersPrizes(usersAddress, draw)
  // NOTE: Assumes draw is unclaimed.
  setStoredDrawResult(
    usersAddress,
    prizeDistributor,
    draw.drawId,
    drawResults,
    StoredDrawStates.unclaimed
  )
  return drawResults
}
