import { Token } from '@pooltogether/hooks'

import { useUpcomingPrizeTier } from '@hooks/v4/PrizePool/useUpcomingPrizeTier'
import { getAmountFromString } from '@utils/getAmountFromString'
import { PrizePool } from '@pooltogether/v4-client-js'

/**
 * @param prizePool
 * @param token
 * @returns
 */
export const useMinimumDepositAmount = (prizePool: PrizePool, token: Token) => {
  const { data: prizeTierData, isFetched } = useUpcomingPrizeTier(prizePool)
  if (!Boolean(token) || !isFetched || prizeTierData.prizePoolId !== prizePool.id()) return null
  return getAmountFromString(
    Math.pow(2, prizeTierData.prizeTier.bitRangeSize).toString(),
    token.decimals
  )
}
