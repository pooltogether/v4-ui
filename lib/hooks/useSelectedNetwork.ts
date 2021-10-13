import { useRouter } from 'next/router'
import { useEffect } from 'react'
import { NETWORK } from '@pooltogether/utilities'
import { atom, useAtom } from 'jotai'

import { URL_QUERY_KEY } from 'lib/constants/urlQueryKeys'
import { DEFAULT_NETWORKS, SUPPORTED_NETWORKS } from 'lib/constants/supportedNetworks'

import { APP_ENVIRONMENTS, getStoredIsTestnetsCookie } from '@pooltogether/hooks'

const parseUrlNetwork = (urlNetwork: string) => {
  const appEnv = getStoredIsTestnetsCookie() ? APP_ENVIRONMENTS.testnets : APP_ENVIRONMENTS.mainnets

  const supportedNetworks = SUPPORTED_NETWORKS[appEnv]
  const defaultNetwork = DEFAULT_NETWORKS[appEnv]

  try {
    const urlChainId = Number(urlNetwork)
    if (supportedNetworks.includes(urlChainId)) {
      return urlChainId
    }
    return defaultNetwork
  } catch (e) {
    console.warn(`Invalid network id ${urlNetwork}`)
    return defaultNetwork
  }
}

/**
 * Initializes the selected network atom.
 * Reads from the app environment & the URL to set the proper
 * initial selected network
 */
const getInitialSelectedNetwork = () => {
  if (typeof window === 'undefined') return NETWORK.mainnet

  const url = new URL(window.location.href)
  const urlNetwork = url.searchParams.get(URL_QUERY_KEY.network)

  const appEnv = getStoredIsTestnetsCookie() ? APP_ENVIRONMENTS.testnets : APP_ENVIRONMENTS.mainnets
  const defaultNetwork = DEFAULT_NETWORKS[appEnv]

  if (urlNetwork) {
    const chainId = parseUrlNetwork(urlNetwork)
    return chainId
  }
  return defaultNetwork
}

export const selectedNetworkAtom = atom<number>(getInitialSelectedNetwork())

export const useSelectedNetwork = () => useAtom(selectedNetworkAtom)

export const useSelectedNetworkWatcher = () => {
  const [selectedNetwork, setSelectedNetwork] = useAtom(selectedNetworkAtom)
  const router = useRouter()
  const networkQueryParam = router.query[URL_QUERY_KEY.network] as string

  // Watch for URL query param changes
  useEffect(() => {
    const newSelectedNetwork = parseUrlNetwork(networkQueryParam)
    if (newSelectedNetwork !== selectedNetwork) {
      setSelectedNetwork(newSelectedNetwork)
    }
  }, [networkQueryParam])

  // Watch for atom changes
  useEffect(() => {
    const queryParamNetwork = parseUrlNetwork(networkQueryParam)
    if (selectedNetwork !== queryParamNetwork) {
      const url = new URL(window.location.href)
      url.searchParams.set(URL_QUERY_KEY.network, String(selectedNetwork))
      router.replace(url, url, { scroll: false })
    }
  }, [selectedNetwork])
}
