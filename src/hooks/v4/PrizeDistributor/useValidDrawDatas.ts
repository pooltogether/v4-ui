import { PrizeDistributor } from '@pooltogether/v4-client-js'

import { DrawData } from '../../../interfaces/v4'
import { useQuery } from 'react-query'
import { useDrawBeaconPeriod } from '../PrizePoolNetwork/useDrawBeaconPeriod'
import { useValidDraws } from './useValidDraws'
import { useValidPrizeDistributions } from './useValidPrizeDistributions'

/**
 * Returns the valid Draws and PrizeDistributions for the provided PrizeDistributor
 * @param prizeDistributor
 * @returns
 */
export const useValidDrawDatas = (prizeDistributor: PrizeDistributor) => {
  const { data: drawBeaconPeriod, isFetched: isDrawBeaconFetched } = useDrawBeaconPeriod()
  const { data, isFetched: isDrawsFetched } = useValidDraws(prizeDistributor)
  const { data: przeDistributions, isFetched: isPrizeDistributionsFetched } =
    useValidPrizeDistributions(prizeDistributor)
  const draws = data?.draws
  const enabled =
    Boolean(prizeDistributor) &&
    isDrawBeaconFetched &&
    isDrawsFetched &&
    isPrizeDistributionsFetched
  return useQuery(
    ['useValidDrawDatas', prizeDistributor?.id(), drawBeaconPeriod?.startedAtSeconds.toString()],
    async () => {
      const drawDatas: { [drawId: number]: DrawData } = {}
      const drawIds = Object.keys(draws).map(Number)
      drawIds.forEach((drawId) => {
        drawDatas[drawId] = {
          draw: draws[drawId],
          prizeDistribution: przeDistributions[drawId]
        }
      })
      return drawDatas
    },
    {
      enabled
    }
  )
}
