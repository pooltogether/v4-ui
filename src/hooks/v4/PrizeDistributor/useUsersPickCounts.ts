import { PrizeDistributor } from '@pooltogether/v4-client-js'
import { BigNumber } from 'ethers'
import { useQuery } from 'react-query'

import { NO_REFETCH } from '@constants/query'
import { msToS } from '@pooltogether/utilities'
import { useAllDrawDatas } from './useAllDrawDatas'
import { DrawData } from '@interfaces/v4'
import { useValidDrawDatas } from './useValidDrawDatas'

/**
 * Returns the users pick counts for all available drawIds
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
  const drawDatas = useValidDrawDatas(prizeDistributor)
  const enabled = !!prizeDistributor && !!usersAddress && !!ticketAddress && !!drawDatas

  return useQuery(
    [
      'useUsersPickCounts',
      prizeDistributor?.id(),
      ticketAddress,
      usersAddress,
      drawDatas ? Object.values(drawDatas).map((drawData) => drawData.draw.drawId) : null
    ],
    () => getUsersPickCounts(usersAddress, ticketAddress, prizeDistributor, drawDatas),
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
  drawDatas: { [drawId: number]: DrawData }
): Promise<{
  usersAddress: string
  pickCounts: {
    [drawId: number]: BigNumber
  }
}> => {
  const drawIds = Object.values(drawDatas).map((drawData) => drawData.draw.drawId)

  const pickCounts = await prizeDistributor.getUsersPickCountForDrawIds(
    usersAddress,
    ticketAddress,
    drawIds
  )

  const pickCountsKeyedByDrawId: {
    [drawId: number]: BigNumber
  } = {}
  drawIds.map((drawIds, index) => {
    pickCountsKeyedByDrawId[drawIds] = pickCounts[index]
  })

  console.log('pickCounts', { drawIds, pickCountsKeyedByDrawId })
  return {
    usersAddress,
    pickCounts: pickCountsKeyedByDrawId
  }
}
