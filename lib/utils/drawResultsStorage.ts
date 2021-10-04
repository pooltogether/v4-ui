import { deserializeBigNumbers } from '@pooltogether/utilities'
import { DrawPrize, DrawResults } from '@pooltogether/v4-js-client'

export enum DrawStates {
  unclaimed = 'UNCLAIMED',
  claimed = 'CLAIMED'
}

interface StoredDrawResult {
  drawResults: DrawResults
  state: DrawStates
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
  state: DrawStates
) => {
  localStorage.setItem(
    getKey(usersAddress, drawPrize, drawId),
    JSON.stringify({
      drawResults,
      state
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
  state: DrawStates
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
