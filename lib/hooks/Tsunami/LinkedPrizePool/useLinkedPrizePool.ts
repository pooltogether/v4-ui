import { initializeLinkedPrizePool, LinkedPrizePool } from '@pooltogether/v4-js-client'
import { NO_REFETCH } from 'lib/constants/queryKeys'
import { useContractListChainIds } from 'lib/hooks/Tsunami/useContractListChainIds'
import { useProvidersKeyedByNumbers } from 'lib/hooks/Tsunami/useProvidersKeyedbyNumbers'
import { useQuery, UseQueryOptions } from 'react-query'
import { useContractList } from '../useContractList'

export const useLinkedPrizePool = () => {
  const linkedPrizePoolContractList = useContractList()
  const chainIds = useContractListChainIds(linkedPrizePoolContractList.contracts)
  const readProviders = useProvidersKeyedByNumbers(chainIds)

  const enabled = Boolean(readProviders)
  return useQuery(
    'useInitializeLinkedPrizePool',
    async () => {
      const linkedPrizePool = await initializeLinkedPrizePool(
        readProviders,
        linkedPrizePoolContractList
      )
      // console.log('linkedPrizePool', linkedPrizePool)
      return linkedPrizePool
    },
    { ...NO_REFETCH, enabled } as UseQueryOptions<LinkedPrizePool>
  )
}
