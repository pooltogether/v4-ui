import { useUpcomingPrizeTier } from '@hooks/v4/PrizePool/useUpcomingPrizeTier'
import { Token } from '@pooltogether/hooks'
import { getAmount } from '@pooltogether/utilities'
import { PrizePool } from '@pooltogether/v4-client-js'

/**
 * @param prizePool
 * @param token
 * @returns
 */
export const useMinimumDepositAmount = (prizePool: PrizePool, token: Token) => {
  const { data, isFetched } = useUpcomingPrizeTier(prizePool)
  if (!Boolean(token) || !isFetched) return null
  return getAmount(Math.pow(2, data.prizeTier.bitRangeSize).toString(), token.decimals)
}
