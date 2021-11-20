import { PrizeDistributor } from '@pooltogether/v4-js-client'
import { useAtom } from 'jotai'

import { drawResultsAtom } from 'lib/utils/drawResultsStorage'
import { useUsersAddress } from '../useUsersAddress'

export const useUsersStoredDrawResults = (prizeDistributor: PrizeDistributor) => {
  const usersAddress = useUsersAddress()
  const [drawResults] = useAtom(drawResultsAtom)
  return drawResults[usersAddress]?.[prizeDistributor.id()]
}
