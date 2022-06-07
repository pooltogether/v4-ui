import { Token } from '@pooltogether/hooks'

import { useUpcomingPrizeConfig } from '@hooks/useUpcomingPrizeConfig'
import { getAmountFromString } from '@utils/getAmountFromString'

/**
 * TODO: NEED TO GET THE MINIMUM DEPOSIT AMOUNT
 
 * @param token
 * @returns
 */
export const useMinimumDepositAmount = (token: Token) => {
  return getAmountFromString('5', token?.decimals)

  const { data: prizeConfig, isFetched } = useUpcomingPrizeConfig()
  if (!Boolean(token) || !isFetched || !prizeConfig) return null
  return getAmountFromString(Math.pow(2, prizeConfig.bitRangeSize).toString(), token.decimals)
}
