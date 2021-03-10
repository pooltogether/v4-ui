import { useContext } from 'react'
import { useQuery } from 'react-query'
import { isEmpty } from 'lodash'

import { MAINNET_POLLING_INTERVAL, QUERY_KEYS } from 'lib/constants'
import { AuthControllerContext } from 'lib/components/contextProviders/AuthControllerContextProvider'
import { fetchExternalErc20Awards } from 'lib/utils/fetchExternalErc20Awards'

const getEthereumErc20Data = async (params) => {
  return await fetchExternalErc20Awards(params)
}

export function useEthereumErc20Query(params) {
  const { chainId, pauseQueries } = useContext(AuthControllerContext)

  const { poolAddress, provider } = params

  let blockNumber = params.blockNumber

  if (!blockNumber) {
    blockNumber = -1
  }

  const enabled = !pauseQueries && chainId && !isEmpty(provider) && !!poolAddress

  const refetchInterval = blockNumber === -1 ? MAINNET_POLLING_INTERVAL : false

  return useQuery(
    [QUERY_KEYS.ethereumErc20sQuery, chainId, poolAddress, -1],
    async () => await getEthereumErc20Data(params),
    {
      enabled,
      refetchInterval
    }
  )
}
