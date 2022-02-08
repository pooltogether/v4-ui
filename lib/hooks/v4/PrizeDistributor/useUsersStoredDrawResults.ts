import { DrawResults, PrizeDistributor } from '@pooltogether/v4-js-client'
import { useAtom } from 'jotai'

import { drawResultsAtom } from 'lib/utils/drawResultsStorage'

export const useUsersStoredDrawResults = (
  usersAddress: string,
  prizeDistributor: PrizeDistributor
): {
  [usersAddress: string]: {
    [drawId: number]: DrawResults
  }
} => {
  const [drawResults] = useAtom(drawResultsAtom)
  const usersDrawResults = drawResults?.[usersAddress]?.[prizeDistributor.id()] || {}
  return { [usersAddress]: usersDrawResults }
}
