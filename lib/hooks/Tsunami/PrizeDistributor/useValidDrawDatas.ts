import { PrizeDistributor } from '@pooltogether/v4-js-client'
import { NO_REFETCH } from 'lib/constants/query'
import { DrawData } from 'lib/types/v4'
import { useQuery } from 'react-query'
import { useDrawBeaconPeriod } from '../LinkedPrizePool/useDrawBeaconPeriod'
import { useValidDraws } from './useValidDraws'
import { useValidPrizeDistributions } from './useValidPrizeDistributions'

/**
 * Returns the valid Draws and PrizeDistributions for the provided PrizeDistributor
 * @param prizeDistributor
 * @returns
 */
export const useValidDrawDatas = (prizeDistributor: PrizeDistributor) => {
  const { data: drawBeaconPeriod, isFetched: isDrawBeaconFetched } = useDrawBeaconPeriod()
  const { data: draws, isFetched: isDrawsFetched } = useValidDraws(prizeDistributor)
  const { data: przeDistributions, isFetched: isPrizeDistributionsFetched } =
    useValidPrizeDistributions(prizeDistributor)
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
      ...NO_REFETCH,
      enabled
    }
  )
}
