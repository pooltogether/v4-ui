import { useSupportedChainIds } from '@hooks/useSupportedChainIds'
import { useMemo } from 'react'

import { usePrizePoolNetwork } from '../PrizePoolNetwork/usePrizePoolNetwork'

export const usePrizeDistributors = () => {
  const prizePoolNetwork = usePrizePoolNetwork()
  const supportedChainIds = useSupportedChainIds()
  return useMemo(
    () =>
      prizePoolNetwork?.prizeDistributors.filter((prizeDistributor) =>
        supportedChainIds.includes(prizeDistributor.chainId)
      ),
    [prizePoolNetwork, supportedChainIds]
  )
}
