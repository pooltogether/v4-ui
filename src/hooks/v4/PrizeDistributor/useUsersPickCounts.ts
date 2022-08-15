import { PrizeDistributorV2 } from '@pooltogether/v4-client-js'
import { BigNumber } from 'ethers'
import { useQuery } from 'react-query'

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
  prizeDistributor: PrizeDistributorV2
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
    () => getUserPickCounts(usersAddress, ticketAddress, prizeDistributor, drawDatas),
    {
      enabled
    }
  )
}

const getUserPickCounts = async (
  usersAddress: string,
  ticketAddress: string,
  prizeDistributor: PrizeDistributorV2,
  drawDatas: { [drawId: number]: DrawData }
): Promise<{
  usersAddress: string
  pickCounts: {
    [drawId: number]: BigNumber
  }
}> => {
  const drawIds = Object.values(drawDatas).map((drawData) => drawData.draw.drawId)

  const pickCounts = await prizeDistributor.getUserPickCountForDrawIds(
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
