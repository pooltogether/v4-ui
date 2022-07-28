import { useGaugeController } from '@hooks/v4/Gauge/useGaugeControllers'
import { useSelectedPrizeDistributor } from '../PrizeDistributor/useSelectedPrizeDistributor'

export const useSelectedGaugeController = () => {
  const prizeDistributor = useSelectedPrizeDistributor()
  return useGaugeController(prizeDistributor)
}
