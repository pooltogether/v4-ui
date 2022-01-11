import { getPoolsByChainIds } from '@pooltogether/hooks'
import { NO_REFETCH } from 'lib/constants/query'
import { useQuery } from 'react-query'

import { useV3ChainIds } from './useV3ChainIds'

/**
 * Fetches v3 Prize Pool data from the cloudflare worker for each chain id.
 * @returns
 */
export const useV3PrizePools = () => {
  const chainIds = useV3ChainIds()
  return useQuery(['useV3PrizePools', chainIds], () => getPoolsByChainIds(chainIds), {
    ...NO_REFETCH
  })
}
