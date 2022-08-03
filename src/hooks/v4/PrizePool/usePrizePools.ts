import { useSupportedChainIds } from '@hooks/useSupportedChainIds'
import { usePrizePoolNetwork } from '@hooks/v4/PrizePoolNetwork/usePrizePoolNetwork'
import { useMemo } from 'react'

/**
 * Filter here to cut off any bad acting prize pools from the single config
 * @returns
 */
export const usePrizePools = () => {
  const prizePoolNetwork = usePrizePoolNetwork()
  const supportedChainIds = useSupportedChainIds()
  return useMemo(
    () =>
      prizePoolNetwork?.prizePools.filter((prizePool) =>
        supportedChainIds.includes(prizePool.chainId)
      ),
    [prizePoolNetwork, supportedChainIds]
  )
}
