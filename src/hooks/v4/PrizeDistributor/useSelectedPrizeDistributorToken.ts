import { useSelectedPrizeDistributor } from './useSelectedPrizeDistributor'
import { usePrizeDistributorToken } from './usePrizeDistributorToken'

export const PRIZE_DISTRIBUTOR_TOKEN_QUERY_KEY = 'usePrizeDistributorToken'

export const useSelectedPrizeDistributorToken = () => {
  const prizeDistributor = useSelectedPrizeDistributor()
  return usePrizeDistributorToken(prizeDistributor)
}
