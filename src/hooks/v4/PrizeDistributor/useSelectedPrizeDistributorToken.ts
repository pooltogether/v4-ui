import { usePrizeDistributorToken } from './usePrizeDistributorToken'
import { useSelectedPrizeDistributor } from './useSelectedPrizeDistributor'

export const PRIZE_DISTRIBUTOR_TOKEN_QUERY_KEY = 'usePrizeDistributorToken'

export const useSelectedPrizeDistributorToken = () => {
  const prizeDistributor = useSelectedPrizeDistributor()
  return usePrizeDistributorToken(prizeDistributor)
}
