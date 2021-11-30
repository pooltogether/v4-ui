import { useRouter } from 'next/router'
import { useEffect } from 'react'
import { atom, useAtom } from 'jotai'

import { URL_QUERY_KEY } from 'lib/constants/urlQueryKeys'
import { DEFAULT_NETWORKS, SUPPORTED_NETWORKS } from 'lib/constants/config'

import { APP_ENVIRONMENTS, getStoredIsTestnetsCookie, useIsTestnets } from '@pooltogether/hooks'
import { CHAIN_ID } from 'lib/constants/constants'
import { useAppEnvString } from './useAppEnvString'
import { useEnvironmentNetworks } from './Tsunami/useEnvironmentNetwork'
import { Network } from 'lib/constants/config'

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
  if (typeof window === 'undefined') return CHAIN_ID.mainnet

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

export const useSelectedNetwork = () => {
  const [chainId, setSelectedChainId] = useAtom(selectedNetworkAtom)
  const envNetworks = useEnvironmentNetworks()
  const networks = Object.keys(envNetworks) as Network[]
  const chainIds = Object.values(envNetworks)
  const network = networks[chainIds.indexOf(chainId)]
  return { chainId, setSelectedChainId, network }
}

export const useSelectedNetworkWatcher = () => {
  const { isTestnets } = useIsTestnets()
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
      router.replace(url, null, { scroll: false })
    }
  }, [selectedNetwork])

  // Watch for testnet changes
  useEffect(() => {
    const testnetDefault = DEFAULT_NETWORKS[APP_ENVIRONMENTS.testnets]
    const mainnetDefault = DEFAULT_NETWORKS[APP_ENVIRONMENTS.mainnets]
    if (isTestnets && selectedNetwork !== testnetDefault) {
      setSelectedNetwork(testnetDefault)
    } else if (!isTestnets && selectedNetwork !== mainnetDefault) {
      setSelectedNetwork(mainnetDefault)
    }
  }, [isTestnets])
}
