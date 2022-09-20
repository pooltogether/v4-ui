import { DrawResults, PrizeDistributor } from '@pooltogether/v4-client-js'
import { drawResultsAtom } from '@utils/drawResultsStorage'
import { useAtom } from 'jotai'


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
