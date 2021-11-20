import { PrizeDistributor } from '@pooltogether/v4-js-client'
import { BigNumber } from 'ethers'
import { useUsersAddress } from 'lib/hooks/useUsersAddress'
import { useQuery } from 'react-query'
import { useValidDrawIds } from './useValidDrawIds'

/**
 * Returns the users normalised balances for all valid drawIds
 * @param prizeDistributor
 * @param token
 * @returns
 */
export const useUsersNormalizedBalances = (prizeDistributor: PrizeDistributor) => {
  const usersAddress = useUsersAddress()
  const { data: drawIds, isFetched: isDrawIdsFetched } = useValidDrawIds(prizeDistributor)
  const enabled = Boolean(prizeDistributor) && Boolean(usersAddress) && isDrawIdsFetched

  return useQuery(
    ['useUsersNormalizedBalances', prizeDistributor?.id(), usersAddress],
    () => getUsersNormalizedBalances(usersAddress, prizeDistributor, drawIds),
    {
      enabled
    }
  )
}

const getUsersNormalizedBalances = async (
  usersAddress: string,
  prizeDistributor: PrizeDistributor,
  drawIds: number[]
) => {
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

  return normalizedBalancesKeyedByDrawId
}
