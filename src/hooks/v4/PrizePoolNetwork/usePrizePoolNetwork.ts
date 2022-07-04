import { useReadProviders } from '@hooks/useReadProviders'
import { getContractListChainIds, PrizePoolNetwork } from '@pooltogether/v4-client-js'
import { useMemo } from 'react'

import { useContractList } from '../useContractList'

export const usePrizePoolNetwork = (): PrizePoolNetwork => {
  const prizePoolNetworkContractList = useContractList()
  const chainIds = getContractListChainIds(prizePoolNetworkContractList.contracts)
  const readProviders = useReadProviders(chainIds)
  return useMemo(() => new PrizePoolNetwork(readProviders, prizePoolNetworkContractList), [])
}
