import { DrawPrize, initializeDrawPrizes } from '@pooltogether/v4-js-client'
import { NO_REFETCH } from 'lib/constants/queryKeys'
import { useContractListChainIds } from 'lib/hooks/Tsunami/useContractListChainIds'
import { useProvidersKeyedByNumbers } from 'lib/hooks/Tsunami/useProvidersKeyedbyNumbers'
import { useQuery, UseQueryOptions } from 'react-query'
import { useContractList } from '../useContractList'

export const useDrawPrizes = () => {
  const linkedPrizePoolContractList = useContractList()
  const chainIds = useContractListChainIds(linkedPrizePoolContractList.contracts)
  const readProviders = useProvidersKeyedByNumbers(chainIds)
  const enabled = Boolean(readProviders)
  return useQuery(
    ['useDrawPrizes', chainIds],
    async () => initializeDrawPrizes(readProviders, linkedPrizePoolContractList),
    { ...NO_REFETCH, enabled } as UseQueryOptions<DrawPrize[]>
  )
}
