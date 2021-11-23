import { PrizeDistributor } from '@pooltogether/v4-js-client'
import { useAtom } from 'jotai'

import { useUsersAddress } from 'lib/hooks/useUsersAddress'
import { drawResultsAtom } from 'lib/utils/drawResultsStorage'

export const useUsersStoredDrawResults = (prizeDistributor: PrizeDistributor) => {
  const usersAddress = useUsersAddress()
  const [drawResults] = useAtom(drawResultsAtom)
  return drawResults[usersAddress]?.[prizeDistributor.id()] || {}
}
