import { deserializeBigNumbers } from '@pooltogether/utilities'
import { PrizeDistributor, DrawResults } from '@pooltogether/v4-client-js'
import { atomWithStorage } from 'jotai/utils'

/**
 * Draw ids the user doesn't want to claim
 */
const DRAW_IDS_TO_NOT_CLAIM_KEY = 'draw_ids_to_not_claim'
export const drawIdsToNotClaimAtom = atomWithStorage(DRAW_IDS_TO_NOT_CLAIM_KEY, new Set<number>(), {
  getItem: (key: string) => {
    const item = localStorage.getItem(key)
    return item ? new Set(item.split(',').map(Number)) : new Set<number>()
  },
  setItem: (key: string, value: Set<number>) => {
    localStorage.setItem(key, Array.from(value).join(','))
  }
})

export interface StoredDrawResults {
  [usersAddress: string]: {
    [prizeDistributorId: string]: {
      [drawId: number]: DrawResults
    }
  }
}

/**
 * Stored draw results so we don't need to refetch/recomputate them
 */
const DRAW_RESULTS_KEY = 'stored_draw_results'
export const drawResultsAtom = atomWithStorage<StoredDrawResults>(
  DRAW_RESULTS_KEY,
  {},
  {
    getItem: (key: string) => {
      const item = localStorage.getItem(key)
      return item ? deserializeBigNumbers(JSON.parse(item)) : {}
    },
    setItem: (key: string, value: any) => {
      localStorage.setItem(key, JSON.stringify(value))
    }
  }
)

export const getStoredDrawResults = (
  usersAddress: string,
  prizeDistributor: PrizeDistributor
): { [drawId: number]: DrawResults } => {
  const storedDrawResults = readStoredDrawResults()
  return storedDrawResults[usersAddress]?.[prizeDistributor.id()] || {}
}

const readStoredDrawResults = (): StoredDrawResults =>
  deserializeBigNumbers(JSON.parse(localStorage.getItem(DRAW_RESULTS_KEY))) || {}

export const updateDrawResults = (
  usersAddress: string,
  prizeDistributor: PrizeDistributor,
  drawResults: { [drawId: number]: DrawResults },
  setStoredDrawResults: (storedDrawResults: StoredDrawResults) => void
) => {
  const storedDrawResults = readStoredDrawResults()
  let usersDrawResults = storedDrawResults[usersAddress]
  if (!usersDrawResults) {
    usersDrawResults = {}
    storedDrawResults[usersAddress] = usersDrawResults
  }
  const usersDrawResultsForPrizeDistributor = usersDrawResults[prizeDistributor.id()]
  if (!usersDrawResultsForPrizeDistributor) {
    usersDrawResults[prizeDistributor.id()] = drawResults
  } else {
    usersDrawResults[prizeDistributor.id()] = {
      ...usersDrawResultsForPrizeDistributor,
      ...drawResults
    }
  }
  setStoredDrawResults(storedDrawResults)
}
