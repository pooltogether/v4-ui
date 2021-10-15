import { Amount, Token } from '@pooltogether/hooks'
import { PrizeDistributor } from '@pooltogether/v4-js-client'
import { useUsersAddress } from 'lib/hooks/useUsersAddress'
import { getAmountFromBigNumber } from 'lib/utils/getAmountFromBigNumber'
import { roundPrizeAmount } from 'lib/utils/roundPrizeAmount'
import { useQuery } from 'react-query'

/**
 * Returns the draws & prize distributions that are valid along with the amount the
 * user has claimed.
 * @param prizeDistributor
 * @param token
 * @returns
 */
export const useUsersClaimedAmounts = (prizeDistributor: PrizeDistributor, token: Token) => {
  const usersAddress = useUsersAddress()
  const enabled = Boolean(prizeDistributor) && Boolean(usersAddress) && Boolean(token)

  return useQuery(
    ['useUsersClaimedAmounts', prizeDistributor?.id()],
    () => getUsersClaimedAmounts(usersAddress, prizeDistributor, token),
    {
      enabled
    }
  )
}

const getUsersClaimedAmounts = async (
  usersAddress: string,
  prizeDistributor: PrizeDistributor,
  token: Token
) => {
  const validDrawIds = await prizeDistributor.getValidDrawIds()
  const claimedAmounts = await prizeDistributor.getUsersClaimedAmounts(usersAddress, validDrawIds)

  const claimedAmountsKeyedByDrawId: {
    [drawId: number]: Amount
  } = {}

  validDrawIds.map((drawId, index) => {
    claimedAmountsKeyedByDrawId[drawId] = roundPrizeAmount(claimedAmounts[index], token.decimals)
  })

  return claimedAmountsKeyedByDrawId
}
