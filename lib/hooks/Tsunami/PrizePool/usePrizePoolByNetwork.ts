import { Network } from 'lib/constants/network'
import { useEnvironmentNetworks } from '../useEnvironmentNetwork'
import { useEnvPrizePoolAddresses } from './useEnvPrizePoolAddresses'
import { usePrizePools } from './usePrizePools'

export const usePrizePoolByNetwork = (network: Network) => {
  const chainIdsByNetwork = useEnvironmentNetworks()
  const prizePoolAddresses = useEnvPrizePoolAddresses()
  const prizePools = usePrizePools()
  return prizePools?.find(
    (prizePool) =>
      prizePool.chainId === chainIdsByNetwork[network] &&
      prizePool.address === prizePoolAddresses[chainIdsByNetwork[network]]
  )
}
