import { useContext } from 'react'
import { useQuery } from 'react-query'
import { isEmpty } from 'lodash'

import {
  MAINNET_POLLING_INTERVAL,
  QUERY_KEYS
} from 'lib/constants'
import { AuthControllerContext } from 'lib/components/contextProviders/AuthControllerContextProvider'
import { getPoolsData } from 'lib/fetchers/getPoolsData'

export function usePoolsQuery(poolAddresses, blockNumber = -1) {
  const { chainId, pauseQueries } = useContext(AuthControllerContext)

  const refetchInterval = (blockNumber === -1) ? 
    MAINNET_POLLING_INTERVAL :
    false

  // enforce The Graph protocol's lowercase needs
  poolAddresses = poolAddresses?.map(address => address.toLowerCase())

  return useQuery(
    [QUERY_KEYS.poolsQuery, chainId, blockNumber],
    async () => { return getPoolsData(chainId, poolAddresses, blockNumber) },
    { 
      enabled: !pauseQueries && chainId && blockNumber && !isEmpty(poolAddresses),
      refetchInterval
    }
  )
}
