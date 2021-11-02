import { Token } from '@pooltogether/hooks'
import { PrizePool } from '@pooltogether/v4-js-client'
import { TSUNAMI_USDC_PRIZE_DISTRIBUTION } from 'lib/constants/prizeDistribution'
import { NO_REFETCH } from 'lib/constants/query'
import { getAmountFromString } from 'lib/utils/getAmountFromString'
import { useQuery } from 'react-query'

export const useMinimumDepositAmount = (prizePool: PrizePool, token: Token) => {
  const enabled = Boolean(prizePool) && Boolean(token)
  return useQuery(
    ['useMinimumDepositAmount', prizePool?.id()],
    () => getMinimumDepositAmount(prizePool, token),
    { ...NO_REFETCH, enabled }
  )
}

/**
 * TODO: Brendan promised that the bit range size would be consistent
 * Eventually we will want to read this from the chain.
 * NOTE: This is the prize distribution of an UPCOMING draw, not one that we
 * can get from the draw history contract
 * @param prizePool
 * @param token
 * @returns
 */
const getMinimumDepositAmount = async (prizePool: PrizePool, token: Token) => {
  return getAmountFromString(
    Math.pow(2, TSUNAMI_USDC_PRIZE_DISTRIBUTION.bitRangeSize).toString(),
    token.decimals
  )
}
