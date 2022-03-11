import { useMemo } from 'react'
import { useReadProviders } from '@pooltogether/hooks'
import { getContractListChainIds, PrizePoolNetwork } from '@pooltogether/v4-client-js'

import { useContractList } from '../useContractList'

export const usePrizePoolNetwork = (): PrizePoolNetwork => {
  const prizePoolNetworkContractList = useContractList()
  const chainIds = getContractListChainIds(prizePoolNetworkContractList.contracts)
  const readProviders = useReadProviders(chainIds)

  return useMemo(() => {
    console.log('INIT PRIZE POOL NETWORK')
    return new PrizePoolNetwork(readProviders, prizePoolNetworkContractList)
  }, [prizePoolNetworkContractList])
}
