import { useReadProvider } from 'lib/hooks/useReadProvider'
import { useEthereumErc20Query } from 'lib/hooks/useEthereumErc20Query'

const debug = require('debug')('pool-app:ChainQueries')

export function useErc20ChainQuery(poolGraphData) {
  const { readProvider } = useReadProvider()

  const poolAddress = poolGraphData?.poolAddress
  const graphExternalErc20Awards = poolGraphData?.externalErc20Awards

  const {
    data: erc20ChainData,
    error: erc20ChainError,
  } = useEthereumErc20Query({
    provider: readProvider,
    graphErc20Awards: graphExternalErc20Awards,
    poolAddress,
  })

  if (erc20ChainError) {
    console.warn(erc20ChainError)
  }

  return { erc20ChainData }
}
