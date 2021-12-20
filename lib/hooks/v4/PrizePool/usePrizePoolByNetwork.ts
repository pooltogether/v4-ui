import { Network } from 'lib/constants/config'
import { useEnvironmentChainIds } from '../useEnvironmentChainIds'
import { useEnvPrizePoolAddresses } from './useEnvPrizePoolAddresses'
import { usePrizePools } from './usePrizePools'

export const usePrizePoolByNetwork = (network: Network) => {
  const chainIdsByNetwork = useEnvironmentChainIds()
  const prizePoolAddresses = useEnvPrizePoolAddresses()
  const prizePools = usePrizePools()
  return prizePools?.find(
    (prizePool) =>
      prizePool.chainId === chainIdsByNetwork[network] &&
      prizePool.address === prizePoolAddresses[chainIdsByNetwork[network]]
  )
}
