import { Token } from '@pooltogether/hooks'

import { useUpcomingPrizeTier } from '@hooks/v4/PrizePool/useUpcomingPrizeTier'
import { getAmountFromString } from '@utils/getAmountFromString'
import { PrizePool } from '@pooltogether/v4-client-js'
import { useSelectedPrizePool } from './useSelectedPrizePool'

/**
 * @param prizePool
 * @param token
 * @returns
 */
export const useMinimumDepositAmount = (prizePool: PrizePool, token: Token) => {
  const { data, isFetched } = useUpcomingPrizeTier(prizePool)
  if (!Boolean(token) || !isFetched) return null
  return getAmountFromString(Math.pow(2, data.prizeTier.bitRangeSize).toString(), token.decimals)
}
