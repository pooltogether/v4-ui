import { Amount, Token } from '@pooltogether/hooks'
import { PrizeDistributorV2 } from '@pooltogether/v4-client-js'
import { useQuery } from 'react-query'

import { roundPrizeAmount } from '@utils/roundPrizeAmount'
import { useAvailableDrawIds } from './useAvailableDrawIds'
import { usePrizeDistributorToken } from './usePrizeDistributorToken'

export const USERS_CLAIMED_AMOUNTS_QUERY_KEY = 'useUsersClaimedAmounts'

/**
 * Returns the amounts a user has claimed for all available draw ids.
 * @param prizeDistributor
 * @param token
 * @returns
 */
export const useUsersClaimedAmounts = (
  usersAddress: string,
  prizeDistributor: PrizeDistributorV2
) => {
  const { data, isFetched: isDrawIdsFetched } = useAvailableDrawIds(prizeDistributor)
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
    () => getUserClaimedAmounts(usersAddress, prizeDistributor, drawIds, token),
    {
      enabled
    }
  )
}

export const getUserClaimedAmounts = async (
  usersAddress: string,
  prizeDistributor: PrizeDistributorV2,
  drawIds: number[],
  token: Token
): Promise<{
  token: Token
  usersAddress: string
  prizeDistributorId: string
  claimedAmounts: { [drawId: number]: Amount }
}> => {
  const claimedAmounts = await prizeDistributor.getUserClaimedAmounts(usersAddress, drawIds)

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
