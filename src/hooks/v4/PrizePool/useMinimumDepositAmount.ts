import { Token } from '@pooltogether/hooks'

import { getAmountFromString } from '@utils/getAmountFromString'
import { useSelectedUpcomingPrizeConfig } from '../PrizeDistributor/useSelectedUpcomingPrizeConfig'

/**
 * TODO: NEED TO GET THE MINIMUM DEPOSIT AMOUNT
 
 * @param token
 * @returns
 */
export const useMinimumDepositAmount = (token: Token) => {
  return getAmountFromString('5', token?.decimals)

  const { data: prizeConfig, isFetched } = useSelectedUpcomingPrizeConfig()
  if (!Boolean(token) || !isFetched || !prizeConfig) return null
  return getAmountFromString(Math.pow(2, prizeConfig.bitRangeSize).toString(), token.decimals)
}
