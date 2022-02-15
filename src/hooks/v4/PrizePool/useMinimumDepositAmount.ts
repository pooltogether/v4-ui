import { Token } from '@pooltogether/hooks'

import { useUpcomingPrizeTier } from '@hooks/useUpcomingPrizeTier'
import { getAmountFromString } from '@utils/getAmountFromString'

/**
 * Brendan promised that the bit range size would be consistent.
 * Eventually we will want to read this from the chain.
 * @param prizePool
 * @param token
 * @returns
 */
export const useMinimumDepositAmount = (token: Token) => {
  const { data: prizeTier, isFetched } = useUpcomingPrizeTier()
  if (!Boolean(token) || !isFetched) return null
  return getAmountFromString(Math.pow(2, prizeTier.bitRangeSize).toString(), token.decimals)
}
