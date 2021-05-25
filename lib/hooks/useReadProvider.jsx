import { useEffect, useState } from 'react'

import { useOnboard } from '@pooltogether/hooks'
import { readProvider } from 'lib/services/readProvider'
import { chainIdToNetworkName } from 'lib/utils/chainIdToNetworkName'

export function useReadProvider() {
  const { network: chainId } = useOnboard()

  const [defaultReadProvider, setDefaultReadProvider] = useState({})

  useEffect(() => {
    const getReadProvider = async () => {
      const networkName = chainIdToNetworkName(chainId)
      if (networkName !== 'unknown network') {
        const defaultReadProvider = await readProvider(networkName)
        setDefaultReadProvider(defaultReadProvider)
      }
    }
    getReadProvider()
  }, [chainId])

  return {
    readProvider: defaultReadProvider,
    isLoaded: Object.keys(defaultReadProvider).length > 0
  }
}
