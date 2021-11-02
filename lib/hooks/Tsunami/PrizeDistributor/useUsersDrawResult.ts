import { deserializeBigNumbers } from '@pooltogether/utilities'
import { PrizeDistributor, Draw, DrawResults } from '@pooltogether/v4-js-client'
import { NO_REFETCH } from 'lib/constants/query'
import { useUsersAddress } from 'lib/hooks/useUsersAddress'
import {
  StoredDrawStates,
  getStoredDrawResult,
  setStoredDrawResult
} from 'lib/utils/drawResultsStorage'
import { useQuery } from 'react-query'

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

  let drawResults: DrawResults
  try {
    const url = getDrawCalcUrl(
      prizeDistributor.chainId,
      prizeDistributor.address,
      usersAddress,
      draw.drawId
    )
    const response = await fetch(url.toString())
    const drawResultsJson = await response.json()
    drawResults = deserializeBigNumbers(drawResultsJson)
  } catch (e) {
    console.log(e.message)
    drawResults = await prizeDistributor.getUsersPrizes(usersAddress, draw)
  }

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

const getDrawCalcUrl = (
  chainId: number,
  prizeDistributorAddress: string,
  usersAddress: string,
  drawId: number
) =>
  `https://tsunami-prizes-production.pooltogether-api.workers.dev/${chainId}/${prizeDistributorAddress}/prizes/${usersAddress}/${drawId}/`
