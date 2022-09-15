import { useSupportedChainIds } from '@hooks/useSupportedChainIds'

import { usePrizePoolNetwork } from '../PrizePoolNetwork/usePrizePoolNetwork'

export const usePrizeDistributors = () => {
  const prizePoolNetwork = usePrizePoolNetwork()
  const supportedChainIds = useSupportedChainIds()
  return prizePoolNetwork?.prizeDistributors.filter((prizePool) =>
    supportedChainIds.includes(prizePool.chainId)
  )
}
