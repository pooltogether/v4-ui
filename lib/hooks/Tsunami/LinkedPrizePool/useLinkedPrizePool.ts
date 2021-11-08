import { LinkedPrizePool } from '@pooltogether/v4-js-client'
import { useContractListChainIds } from 'lib/hooks/Tsunami/useContractListChainIds'
import { useProvidersKeyedByNumbers } from 'lib/hooks/Tsunami/useProvidersKeyedbyNumbers'
import { useMemo } from 'react'
import { useContractList } from '../useContractList'

export const useLinkedPrizePool = (): LinkedPrizePool => {
  const linkedPrizePoolContractList = useContractList()
  const chainIds = useContractListChainIds(linkedPrizePoolContractList.contracts)
  const readProviders = useProvidersKeyedByNumbers(chainIds)

  return useMemo(() => {
    if (!readProviders || !linkedPrizePoolContractList) return undefined
    return new LinkedPrizePool(readProviders, linkedPrizePoolContractList)
  }, [readProviders ? Object.keys(readProviders) : '', chainIds, linkedPrizePoolContractList.name])
}
