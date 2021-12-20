import { useMemo } from 'react'
import { useReadProviders } from '@pooltogether/hooks'
import { getContractListChainIds, PrizePoolNetwork } from '@pooltogether/v4-js-client'

import { useContractList } from '../useContractList'

export const usePrizePoolNetwork = (): PrizePoolNetwork => {
  const prizePoolNetworkContractList = useContractList()
  const chainIds = getContractListChainIds(prizePoolNetworkContractList.contracts)
  const readProviders = useReadProviders(chainIds)

  return useMemo(() => {
    return new PrizePoolNetwork(readProviders, prizePoolNetworkContractList)
  }, [prizePoolNetworkContractList])
}
