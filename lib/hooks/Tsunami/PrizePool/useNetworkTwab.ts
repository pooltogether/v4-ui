import { Network } from 'lib/constants/network'
import { useEnvPrizePoolAddresses } from 'lib/hooks/Tsunami/PrizePool/useEnvPrizePoolAddresses'
import { usePrizePools } from 'lib/hooks/Tsunami/PrizePool/usePrizePools'
import { useUsersCurrentPrizePoolTwab } from 'lib/hooks/Tsunami/PrizePool/useUsersCurrentPrizePoolTwab'
import { useEnvironmentNetworks } from 'lib/hooks/Tsunami/useEnvironmentNetwork'

export const useNetworkTwab = (network: Network) => {
  const chainIds = useEnvironmentNetworks()
  const prizePoolAddresses = useEnvPrizePoolAddresses()
  const prizePools = usePrizePools()
  return useUsersCurrentPrizePoolTwab(
    prizePools?.find(
      (prizePool) =>
        prizePool.chainId === chainIds[network] &&
        prizePool.address === prizePoolAddresses[chainIds[network]]
    )
  )
}
