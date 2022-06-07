import { DrawData } from '@interfaces/v4'
import { msToS } from '@pooltogether/utilities'
import { PrizeDistributorV2 } from '@pooltogether/v4-client-js'
import { useMemo } from 'react'
import { useAllDrawDatas } from './useAllDrawDatas'

export const useValidDrawDatas = (
  prizeDistributor: PrizeDistributorV2
): { [drawId: number]: DrawData } => {
  const { data, isFetched } = useAllDrawDatas(prizeDistributor)
  return useMemo(() => {
    if (!isFetched) return null
    const drawDatas = Object.values(data)
    const validDrawDatas = drawDatas.filter((drawData) => isDrawNotExpired(drawData))
    return validDrawDatas.reduce((drawDatas, drawData) => {
      drawDatas[drawData.draw.drawId] = drawData
      return drawDatas
    }, {})
  }, [isFetched, data ? Object.values(data)[Object.values(data).length - 1].draw.drawId : null])
}

const isDrawNotExpired = (drawData: DrawData) => {
  const { draw, prizeConfig } = drawData
  const drawTimestampSeconds = draw.timestamp.toNumber()
  const drawExpirationTimestampSeconds = prizeConfig.expiryDuration + drawTimestampSeconds
  const currentTimestampSeconds = msToS(Date.now())
  return currentTimestampSeconds < drawExpirationTimestampSeconds
}
