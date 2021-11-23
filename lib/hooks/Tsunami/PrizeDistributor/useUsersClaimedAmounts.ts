import { Amount } from '@pooltogether/hooks'
import { PrizeDistributor } from '@pooltogether/v4-js-client'
import { useQuery } from 'react-query'

import { NO_REFETCH } from 'lib/constants/query'
import { useUsersAddress } from 'lib/hooks/useUsersAddress'
import { roundPrizeAmount } from 'lib/utils/roundPrizeAmount'
import { useTicketDecimals } from '../PrizePool/useTicketDecimals'
import { useValidDrawIds } from './useValidDrawIds'

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
  const { data: drawIds, isFetched: isDrawIdsFetched } = useValidDrawIds(prizeDistributor)
  const { data: decimals, isFetched: isDecimalsFetched } = useTicketDecimals()
  const enabled =
    Boolean(prizeDistributor) && Boolean(usersAddress) && isDrawIdsFetched && isDecimalsFetched

  return useQuery(
    ['useUsersClaimedAmounts', prizeDistributor?.id(), usersAddress],
    () => getUsersClaimedAmounts(usersAddress, prizeDistributor, drawIds, decimals),
    {
      ...NO_REFETCH,
      enabled
    }
  )
}

const getUsersClaimedAmounts = async (
  usersAddress: string,
  prizeDistributor: PrizeDistributor,
  drawIds: number[],
  decimals: string
): Promise<{
  [usersAddress: string]: {
    [drawId: number]: Amount
  }
}> => {
  const claimedAmounts = await prizeDistributor.getUsersClaimedAmounts(usersAddress, drawIds)

  const claimedAmountsKeyedByDrawId: {
    [drawId: number]: Amount
  } = {}

  drawIds.map((drawId) => {
    claimedAmountsKeyedByDrawId[drawId] = roundPrizeAmount(claimedAmounts[drawId], decimals)
  })
  return {
    [usersAddress]: claimedAmountsKeyedByDrawId
  }
}
