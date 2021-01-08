import { useContext } from 'react'
import { isEmpty } from 'lodash'

import { POOLS } from 'lib/constants'
import { AuthControllerContext } from 'lib/components/contextProviders/AuthControllerContextProvider'
import { usePoolsQuery } from 'lib/hooks/usePoolsQuery'
import { getContractAddresses } from 'lib/services/getContractAddresses'
import { getPoolDataFromQueryResult } from 'lib/services/getPoolDataFromQueryResult'
import { poolToast } from 'lib/utils/poolToast'

export function usePools() {
  const { supportedNetwork, chainId } = useContext(AuthControllerContext)

  let contractAddresses
  try {
    if (supportedNetwork) {
      contractAddresses = getContractAddresses(chainId)
    }
  } catch (e) {
    poolToast.error(e)
    console.error(e)
  }

  const blockNumber = -1
  const poolAddresses = contractAddresses?.pools
  let {
    refetch: refetchPoolsData,
    data: poolsGraphData,
    error: poolsError,
    isFetching: poolsIsFetching,
  } = usePoolsQuery(poolAddresses, blockNumber)


  if (poolsError) {
    poolToast.error(poolsError)
    console.error(poolsError)
  }

  poolsGraphData = getPoolDataFromQueryResult(chainId, contractAddresses, poolsGraphData)






  const poolsDataLoading = !poolsGraphData

  if (!poolsIsFetching && !isEmpty(poolsGraphData)) {
    // this should obviously be moved out of the global window namespace :)
    window.hideGraphError()
  }


  let pools = []

  if (contractAddresses && POOLS[chainId]) {
    POOLS[chainId].forEach(POOL => {
      const _pool = {
        ...POOL,
        id: contractAddresses[POOL.symbol],
      }
  
      if (_pool?.id) {
        pools.push(_pool)
      }
    })
  }

  return {
    pools,
    loading: poolsDataLoading,
    contractAddresses,
    refetchPoolsData,
    poolsGraphData,
  }
}
