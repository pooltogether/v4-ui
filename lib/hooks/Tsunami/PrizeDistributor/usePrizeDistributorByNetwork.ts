import { Network } from 'lib/constants/config'
import { useEnvironmentChainIds } from '../useEnvironmentChainIds'
import { useEnvPrizeDistributorAddresses } from './useEnvPrizeDistributorAddresses'
import { usePrizeDistributors } from './usePrizeDistributors'

export const usePrizeDistributorByNetwork = (network: Network) => {
  const chainIdsByNetwork = useEnvironmentChainIds()
  const prizeDistributorAddresses = useEnvPrizeDistributorAddresses()
  const prizeDistributors = usePrizeDistributors()
  return prizeDistributors?.find(
    (prizeDistributor) =>
      prizeDistributor.chainId === chainIdsByNetwork[network] &&
      prizeDistributor.address === prizeDistributorAddresses[chainIdsByNetwork[network]]
  )
}
