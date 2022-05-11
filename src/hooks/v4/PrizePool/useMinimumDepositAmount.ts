import { Token } from '@pooltogether/hooks'

import { useUpcomingPrizeTier } from '@hooks/useUpcomingPrizeTier'
import { getAmountFromString } from '@utils/getAmountFromString'

/**
 * TODO: NEED TO GET THE MINIMUM DEPOSIT AMOUNT
 
 * @param token
 * @returns
 */
export const useMinimumDepositAmount = (token: Token) => {
  return getAmountFromString('5', token?.decimals)

  const { data: prizeTier, isFetched } = useUpcomingPrizeTier()
  if (!Boolean(token) || !isFetched || !prizeTier) return null
  return getAmountFromString(Math.pow(2, prizeTier.bitRangeSize).toString(), token.decimals)
}
