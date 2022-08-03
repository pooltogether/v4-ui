import { Amount, Token } from '@pooltogether/hooks'
import { PrizeDistributor } from '@pooltogether/v4-client-js'
import { useQuery } from 'react-query'

import { roundPrizeAmount } from '@utils/roundPrizeAmount'
import { useValidDrawIds } from './useValidDrawIds'
import { usePrizeDistributorToken } from './usePrizeDistributorToken'

export const USERS_CLAIMED_AMOUNTS_QUERY_KEY = 'useUsersClaimedAmounts'

/**
 * Returns the amounts a user has claimed for all valid draw ids.
 * @param prizeDistributor
 * @param token
 * @returns
 */
export const useUsersClaimedAmounts = (
  usersAddress: string,
  prizeDistributor: PrizeDistributor
) => {
  const { data, isFetched: isDrawIdsFetched } = useValidDrawIds(prizeDistributor)
  const { data: prizeDistributorTokenData, isFetched: isPrizeDistributorTokenFetched } =
    usePrizeDistributorToken(prizeDistributor)
  const enabled =
    Boolean(prizeDistributor) &&
    Boolean(usersAddress) &&
    isDrawIdsFetched &&
    isPrizeDistributorTokenFetched

  const drawIds = data?.drawIds
  const token = prizeDistributorTokenData?.token

  return useQuery(
    [USERS_CLAIMED_AMOUNTS_QUERY_KEY, prizeDistributor?.id(), usersAddress],
    () => getUsersClaimedAmounts(usersAddress, prizeDistributor, drawIds, token),
    {
      enabled
    }
  )
}

export const getUsersClaimedAmounts = async (
  usersAddress: string,
  prizeDistributor: PrizeDistributor,
  drawIds: number[],
  token: Token
): Promise<{
  token: Token
  usersAddress: string
  prizeDistributorId: string
  claimedAmounts: { [drawId: number]: Amount }
}> => {
  const claimedAmounts = await prizeDistributor.getUsersClaimedAmounts(usersAddress, drawIds)

  const claimedAmountsKeyedByDrawId: {
    [drawId: number]: Amount
  } = {}
  drawIds.map((drawId) => {
    claimedAmountsKeyedByDrawId[drawId] = roundPrizeAmount(claimedAmounts[drawId], token.decimals)
  })

  return {
    token,
    prizeDistributorId: prizeDistributor.id(),
    usersAddress,
    claimedAmounts: claimedAmountsKeyedByDrawId
  }
}
