import { DrawResults, PrizeDistributor } from '@pooltogether/v4-client-js'
import { useAtom } from 'jotai'

import { drawResultsAtom } from '@utils/drawResultsStorage'
import { Token } from '@pooltogether/hooks'

export const useUsersStoredDrawResults = (
  usersAddress: string,
  prizeDistributor: PrizeDistributor,
  ticket: Token
): {
  [usersAddress: string]: {
    [drawId: number]: DrawResults
  }
} => {
  const [drawResults] = useAtom(drawResultsAtom)
  const usersDrawResults =
    drawResults?.[usersAddress]?.[prizeDistributor.id()]?.[ticket?.address] || {}

  // console.log('Stored draw results', { usersDrawResults })
  return { [usersAddress]: usersDrawResults }
}
