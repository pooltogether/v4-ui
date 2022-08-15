import { useSelectedPrizeDistributor } from './useSelectedPrizeDistributor'
import { useUpcomingPrizeConfig } from './useUpcomingPrizeConfig'

export const useSelectedUpcomingPrizeConfig = () => {
  const prizeDistributor = useSelectedPrizeDistributor()
  return useUpcomingPrizeConfig(prizeDistributor)
}
