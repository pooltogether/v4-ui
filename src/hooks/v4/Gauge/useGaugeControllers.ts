import { NO_REFETCH } from '@constants/query'
import { PrizeDistributorV2 } from '@pooltogether/v4-client-js'
import { useQueries, useQuery } from 'react-query'
import { usePrizeDistributors } from '../PrizeDistributor/usePrizeDistributors'

const getQueryKey = (prizeDistributor: PrizeDistributorV2) => [
  ['getGaugeController', prizeDistributor.id()]
]

/**
 *
 * @param prizeDistributor
 * @returns
 */
export const useGaugeController = (prizeDistributor: PrizeDistributorV2) => {
  return useQuery(getQueryKey(prizeDistributor), () => getGaugeController(prizeDistributor), {
    ...NO_REFETCH,
    enabled: !!prizeDistributor
  })
}

/**
 *
 * @returns
 */
export const useAllGaugeControllers = () => {
  const prizeDistributors = usePrizeDistributors()
  return useQueries(
    prizeDistributors.map((prizeDistributor) => ({
      ...NO_REFETCH,
      queryKey: getQueryKey(prizeDistributor),
      queryFn: async () => getGaugeController(prizeDistributor)
    }))
  )
}

const getGaugeController = (prizeDistributor: PrizeDistributorV2) =>
  prizeDistributor.getGaugeController()
