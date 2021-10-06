import { deserializeBigNumbers } from '@pooltogether/utilities'
import { DrawPrize, DrawResults } from '@pooltogether/v4-js-client'

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
 * @param drawPrize
 * @param drawId
 */
export const getStoredDrawResult = (
  usersAddress: string,
  drawPrize: DrawPrize,
  drawId: number
): StoredDrawResult => {
  const results = localStorage.getItem(getKey(usersAddress, drawPrize, drawId))
  if (!results) return null
  return deserializeBigNumbers(JSON.parse(results))
}

/**
 * Store draw results in local storage
 * @param drawPrize
 * @param drawId
 * @param drawResults
 * @param state
 */
export const setStoredDrawResult = (
  usersAddress: string,
  drawPrize: DrawPrize,
  drawId: number,
  drawResults: DrawResults,
  state: StoredDrawStates
) => {
  localStorage.setItem(
    getKey(usersAddress, drawPrize, drawId),
    JSON.stringify({
      drawResults,
      state,
      _lastEdited: Date.now()
    })
  )
}

/**
 * Updates just the state of a stored draw
 * @param drawPrize
 * @param drawId
 * @param state
 */
export const updateStoredDrawResultState = (
  usersAddress: string,
  drawPrize: DrawPrize,
  drawId: number,
  state: StoredDrawStates
) => {
  const results = getStoredDrawResult(usersAddress, drawPrize, drawId)
  setStoredDrawResult(
    usersAddress,
    drawPrize,
    results.drawResults.drawId,
    results.drawResults,
    state
  )
}

const getKey = (usersAddress: string, drawPrize: DrawPrize, drawId: number) =>
  `${usersAddress}-draw-results-${drawPrize.id()}-${drawId}`
