import { deserializeBigNumbers } from '@pooltogether/utilities'
import { PrizeDistributorV2, DrawResults } from '@pooltogether/v4-client-js'
import { atomWithStorage } from 'jotai/utils'

/**
 * Draw ids the user doesn't want to claim
 */
const DRAW_IDS_TO_NOT_CLAIM_KEY = 'draw_ids_to_not_claim'
export const drawIdsToNotClaimAtom = atomWithStorage<Set<number>>(
  DRAW_IDS_TO_NOT_CLAIM_KEY,
  new Set<number>(),
  {
    getItem: (key: string) => {
      const item = localStorage.getItem(key)
      return item ? new Set(item.split(',').map(Number)) : new Set<number>()
    },
    setItem: async (key: string, value: Set<number>) => {
      localStorage.setItem(key, Array.from(value).join(','))
    },
    removeItem: (key: string) => {
      // TODO:
    }
  }
)

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
    setItem: async (key: string, value: StoredDrawResults) => {
      localStorage.setItem(key, JSON.stringify(value))
    },
    removeItem: (key: string) => {
      // TODO:
    }
  }
)

export const getStoredDrawResults = (
  usersAddress: string,
  prizeDistributor: PrizeDistributorV2,
  ticketAddress: string
): { [drawId: number]: DrawResults } => {
  const storedDrawResults = readStoredDrawResults()
  return storedDrawResults[usersAddress]?.[prizeDistributor.id()] || {}
}

const readStoredDrawResults = (): StoredDrawResults =>
  deserializeBigNumbers(JSON.parse(localStorage.getItem(DRAW_RESULTS_KEY))) || {}

export const updateDrawResults = (
  usersAddress: string,
  prizeDistributor: PrizeDistributorV2,
  ticketAddress: string,
  drawResults: { [drawId: number]: DrawResults },
  setStoredDrawResults: (storedDrawResults: StoredDrawResults) => void
) => {
  const storedDrawResults = readStoredDrawResults()
  let usersDrawResults = storedDrawResults[usersAddress]
  if (!usersDrawResults) {
    usersDrawResults = {}
    storedDrawResults[usersAddress] = usersDrawResults
  }
  let usersDrawResultsForPrizeDistributor = usersDrawResults[prizeDistributor.id()]
  if (!usersDrawResultsForPrizeDistributor) {
    usersDrawResultsForPrizeDistributor = {}
  }

  let usersDrawResultsForPrizePool = usersDrawResultsForPrizeDistributor[ticketAddress]
  if (!usersDrawResultsForPrizePool) {
    usersDrawResultsForPrizePool = drawResults
  } else {
    usersDrawResults[prizeDistributor.id()][ticketAddress] = {
      ...usersDrawResultsForPrizePool,
      ...drawResults
    }
  }
  setStoredDrawResults(storedDrawResults)
}
