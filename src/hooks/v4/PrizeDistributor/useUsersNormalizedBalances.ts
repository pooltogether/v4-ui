import { PrizeDistributor } from '@pooltogether/v4-js-client'
import { BigNumber } from 'ethers'
import { useQuery } from 'react-query'

import { NO_REFETCH } from '@src/constants/query'
import { useValidDrawIds } from './useValidDrawIds'

/**
 * Returns the users normalised balances for all valid drawIds
 * @param prizeDistributor
 * @param token
 * @returns
 */
export const useUsersNormalizedBalances = (
  usersAddress: string,
  prizeDistributor: PrizeDistributor
) => {
  const { data, isFetched: isDrawIdsFetched } = useValidDrawIds(prizeDistributor)
  const enabled = Boolean(prizeDistributor) && Boolean(usersAddress) && isDrawIdsFetched
  const drawIds = data?.drawIds

  return useQuery(
    ['useUsersNormalizedBalances', prizeDistributor?.id(), usersAddress],
    () => getUsersNormalizedBalances(usersAddress, prizeDistributor, drawIds),
    {
      ...NO_REFETCH,
      enabled
    }
  )
}

const getUsersNormalizedBalances = async (
  usersAddress: string,
  prizeDistributor: PrizeDistributor,
  drawIds: number[]
): Promise<{
  [usersAddress: string]: {
    [drawId: number]: BigNumber
  }
}> => {
  const normalizedBalances = await prizeDistributor.getUsersNormalizedBalancesForDrawIds(
    usersAddress,
    drawIds
  )

  const normalizedBalancesKeyedByDrawId: {
    [drawId: number]: BigNumber
  } = {}

  drawIds.map((drawId, index) => {
    normalizedBalancesKeyedByDrawId[drawId] = normalizedBalances[index]
  })
  return {
    [usersAddress]: normalizedBalancesKeyedByDrawId
  }
}
