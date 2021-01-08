import { useContext, useEffect, useState } from 'react'

import { AuthControllerContext } from 'lib/components/contextProviders/AuthControllerContextProvider'
import { readProvider } from 'lib/services/readProvider'

export function useReadProvider() {
  const { networkName } = useContext(AuthControllerContext)

  const [defaultReadProvider, setDefaultReadProvider] = useState({})
  
  useEffect(() => {
    const getReadProvider = async () => {
      const defaultReadProvider = await readProvider(networkName)
      setDefaultReadProvider(defaultReadProvider)
    }
    getReadProvider()
  }, [networkName])
    
  return { readProvider: defaultReadProvider }
}
