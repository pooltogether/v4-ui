import { useSelectedPrizeDistributor } from '../PrizeDistributor/useSelectedPrizeDistributor'
import { useDrawBeaconPeriod } from '../PrizeDistributor/useDrawBeaconPeriod'

/**
 * NOTE: This is often used to trigger refetches. It may not be linked to the prize pool/prize distributor that data is being fetched for. We may need to update all of those to be listening to their respective draw beacons.
 * @returns
 */
export const useSelectedDrawBeaconPeriod = () => {
  const prizeDistributor = useSelectedPrizeDistributor()
  return useDrawBeaconPeriod(prizeDistributor)
}
