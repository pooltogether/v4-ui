import { deserializeBigNumbers } from '@pooltogether/utilities'
import { PrizeDistributor, DrawResults } from '@pooltogether/v4-js-client'

// TODO: What happens when a tx fails or gets overwritten or cancelled?
// We have claimed here, but it's not actually claimed :(

export enum StoredDrawStates {
  unclaimed = 'UNCLAIMED',
  claimed = 'CLAIMED'
}

interface StoredDrawResult {
  drawResults: DrawResults
  state: StoredDrawStates
  _lastEdited: number
}

/**
 * Reads draw results from local storage
 * @param prizeDistributor
 * @param drawId
 */
export const getStoredDrawResult = (
  usersAddress: string,
  prizeDistributor: PrizeDistributor,
  drawId: number
): StoredDrawResult => {
  const results = localStorage.getItem(getKey(usersAddress, prizeDistributor, drawId))
  if (!results) return null
  return deserializeBigNumbers(JSON.parse(results))
}

/**
 * Store draw results in local storage
 * @param prizeDistributor
 * @param drawId
 * @param drawResults
 * @param state
 */
export const setStoredDrawResult = (
  usersAddress: string,
  prizeDistributor: PrizeDistributor,
  drawId: number,
  drawResults: DrawResults,
  state: StoredDrawStates
) => {
  localStorage.setItem(
    getKey(usersAddress, prizeDistributor, drawId),
    JSON.stringify({
      drawResults,
      state,
      _lastEdited: Date.now()
    })
  )
}

/**
 * Updates just the state of a stored draw
 * @param prizeDistributor
 * @param drawId
 * @param state
 */
export const updateStoredDrawResultState = (
  usersAddress: string,
  prizeDistributor: PrizeDistributor,
  drawId: number,
  state: StoredDrawStates
) => {
  const results = getStoredDrawResult(usersAddress, prizeDistributor, drawId)
  setStoredDrawResult(
    usersAddress,
    prizeDistributor,
    results.drawResults.drawId,
    results.drawResults,
    state
  )
}

const getKey = (usersAddress: string, prizeDistributor: PrizeDistributor, drawId: number) =>
  `${usersAddress}-draw-results-${prizeDistributor.id()}-${drawId}`
