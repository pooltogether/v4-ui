import { PrizeDistributor } from '@pooltogether/v4-client-js'
import { BigNumber } from 'ethers'
import { useQuery } from 'react-query'

import { NO_REFETCH } from '@constants/query'
import { useValidDrawIds } from './useValidDrawIds'

/**
 * Returns the users pick counts for all valid drawIds
 * @param usersAddress
 * @param ticketAddress
 * @param prizeDistributor
 * @returns
 */
export const useUsersPickCounts = (
  usersAddress: string,
  ticketAddress: string,
  prizeDistributor: PrizeDistributor
) => {
  const { data, isFetched: isDrawIdsFetched } = useValidDrawIds(prizeDistributor)
  const enabled = !!prizeDistributor && !!usersAddress && !!ticketAddress && isDrawIdsFetched
  const drawIds = data?.drawIds

  return useQuery(
    ['useUsersPickCounts', prizeDistributor?.id(), ticketAddress, usersAddress],
    () => getUsersPickCounts(usersAddress, ticketAddress, prizeDistributor, drawIds),
    {
      ...NO_REFETCH,
      enabled
    }
  )
}

const getUsersPickCounts = async (
  usersAddress: string,
  ticketAddress: string,
  prizeDistributor: PrizeDistributor,
  drawIds: number[]
): Promise<{
  usersAddress: string
  pickCounts: {
    [drawId: number]: BigNumber
  }
}> => {
  const pickCounts = await prizeDistributor.getUsersPickCountForDrawIds(
    usersAddress,
    ticketAddress,
    drawIds
  )

  const pickCountsKeyedByDrawId: {
    [drawId: number]: BigNumber
  } = {}

  drawIds.map((drawId, index) => {
    pickCountsKeyedByDrawId[drawId] = pickCounts[index]
  })
  return {
    usersAddress,
    pickCounts: pickCountsKeyedByDrawId
  }
}
