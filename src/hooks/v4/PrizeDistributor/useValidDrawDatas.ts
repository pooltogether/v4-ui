import { DrawData } from '@interfaces/v4'
import { msToS } from '@pooltogether/utilities'
import { PrizeDistributor } from '@pooltogether/v4-client-js'
import { getTimestampString, getTimestampStringWithTime } from '@utils/getTimestampString'
import { useMemo } from 'react'
import { useAllDrawDatas } from './useAllDrawDatas'

export const useValidDrawDatas = (
  prizeDistributor: PrizeDistributor
): { [drawId: number]: DrawData } => {
  const { data, isFetched } = useAllDrawDatas(prizeDistributor)
  return useMemo(() => {
    if (!isFetched) return null
    const drawDatas = Object.values(data)
    const validDrawDatas = drawDatas.filter((drawData) => isDrawNotExpired(drawData))

    console.log({
      allDrawIds: drawDatas.map((drawData) => ({
        id: drawData.draw.drawId,
        draw: drawData.draw,
        prizeTier: drawData.prizeTier,
        start: getTimestampStringWithTime(drawData.draw.timestamp.toNumber()),
        end: getTimestampStringWithTime(
          drawData.draw.timestamp.toNumber() + drawData.prizeTier.expiryDuration
        )
      })),
      validDrawIds: validDrawDatas.map((drawData) => drawData.draw.drawId)
    })

    return validDrawDatas.reduce((drawDatas, drawData) => {
      drawDatas[drawData.draw.drawId] = drawData
      return drawDatas
    }, {})
  }, [isFetched, data ? Object.values(data)[Object.values(data).length - 1].draw.drawId : null])
}

const isDrawNotExpired = (drawData: DrawData) => {
  const { draw, prizeTier } = drawData
  const drawTimestampSeconds = draw.timestamp.toNumber()
  const drawExpirationTimestampSeconds = prizeTier.expiryDuration + drawTimestampSeconds
  const currentTimestampSeconds = msToS(Date.now())
  return currentTimestampSeconds < drawExpirationTimestampSeconds
}
