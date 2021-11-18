import { deserializeBigNumbers } from '@pooltogether/utilities'
import { PrizeDistributor, DrawResults } from '@pooltogether/v4-js-client'
import { atomWithStorage } from 'jotai/utils'

interface StoredDrawResult {
  drawResults: DrawResults
  _lastEdited: number
}

/**
 * Reads multiple draw results from local storage
 * @param prizeDistributor
 * @param drawId
 */
export const getStoredDrawResults = (
  usersAddress: string,
  prizeDistributor: PrizeDistributor,
  drawIds: number[]
): { [drawId: number]: StoredDrawResult } => {
  const allStoredDrawResults: { [drawId: number]: StoredDrawResult } = {}
  drawIds.forEach(
    (drawId) =>
      (allStoredDrawResults[drawId] = getStoredDrawResult(usersAddress, prizeDistributor, drawId))
  )
  return allStoredDrawResults
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
  drawResults: DrawResults
) => {
  localStorage.setItem(
    getKey(usersAddress, prizeDistributor, drawId),
    JSON.stringify({
      drawResults,
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
  drawId: number
) => {
  const results = getStoredDrawResult(usersAddress, prizeDistributor, drawId)
  setStoredDrawResult(
    usersAddress,
    prizeDistributor,
    results.drawResults.drawId,
    results.drawResults
  )
}

const getKey = (usersAddress: string, prizeDistributor: PrizeDistributor, drawId: number) =>
  `${usersAddress}-draw-results-${prizeDistributor.id()}-${drawId}`

// NEW STORAGE

const DRAW_RESULTS_KEY = 'stored_draw_results'
export const drawResultsAtom = atomWithStorage(
  DRAW_RESULTS_KEY,
  {},
  {
    getItem: (key: string) => {
      const item = localStorage.getItem(key)
      return item ? deserializeBigNumbers(JSON.parse(item)) : null
    },
    setItem: (key: string, value: any) => {
      localStorage.setItem(key, JSON.stringify(value))
    }
  }
)
