import { useContext, useEffect, useState } from 'react'

import { AuthControllerContext } from 'lib/components/contextProviders/AuthControllerContextProvider'
import { readProvider } from 'lib/services/readProvider'

export function useReadProvider() {
  const { networkName } = useContext(AuthControllerContext)

  const [defaultReadProvider, setDefaultReadProvider] = useState({})

  useEffect(() => {
    const getReadProvider = async () => {
      if (networkName !== 'unknown network') {
        const defaultReadProvider = await readProvider(networkName)
        setDefaultReadProvider(defaultReadProvider)
      }
    }
    getReadProvider()
  }, [networkName])

  return {
    readProvider: defaultReadProvider,
    isLoaded: Object.keys(defaultReadProvider).length > 0
  }
}
