import { useRouter } from 'next/router'
import { useEffect } from 'react'
import { atom, useAtom } from 'jotai'
import { APP_ENVIRONMENTS, getStoredIsTestnetsCookie, useIsTestnets } from '@pooltogether/hooks'

import { URL_QUERY_KEY } from 'lib/constants/urlQueryKeys'
import { DEFAULT_CHAIN_IDS, SUPPORTED_CHAIN_IDS } from 'lib/constants/config'
import { CHAIN_ID } from 'lib/constants/constants'

const parseUrlNetwork = (urlNetwork: string) => {
  const appEnv = getStoredIsTestnetsCookie() ? APP_ENVIRONMENTS.testnets : APP_ENVIRONMENTS.mainnets

  const supportedChainIds = SUPPORTED_CHAIN_IDS[appEnv]
  const defaultChainId = DEFAULT_CHAIN_IDS[appEnv]

  try {
    const urlChainId = Number(urlNetwork)
    if (supportedChainIds.includes(urlChainId)) {
      return urlChainId
    }
    return defaultChainId
  } catch (e) {
    console.warn(`Invalid network id ${urlNetwork}`)
    return defaultChainId
  }
}

/**
 * Initializes the selected network atom.
 * Reads from the app environment & the URL to set the proper
 * initial selected network
 */
const getInitialSelectedChainId = () => {
  if (typeof window === 'undefined') return CHAIN_ID.mainnet

  const url = new URL(window.location.href)
  const urlNetwork = url.searchParams.get(URL_QUERY_KEY.network)

  const appEnv = getStoredIsTestnetsCookie() ? APP_ENVIRONMENTS.testnets : APP_ENVIRONMENTS.mainnets
  const defaultChainId = DEFAULT_CHAIN_IDS[appEnv]

  if (urlNetwork) {
    const chainId = parseUrlNetwork(urlNetwork)
    return chainId
  }
  return defaultChainId
}

export const selectedNetworkAtom = atom<number>(getInitialSelectedChainId())

export const useSelectedChainId = () => {
  const [chainId, setSelectedChainId] = useAtom(selectedNetworkAtom)
  return { chainId, setSelectedChainId }
}

export const useSelectedChainIdWatcher = () => {
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
    const testnetDefault = DEFAULT_CHAIN_IDS[APP_ENVIRONMENTS.testnets]
    const mainnetDefault = DEFAULT_CHAIN_IDS[APP_ENVIRONMENTS.mainnets]
    if (isTestnets && selectedNetwork !== testnetDefault) {
      setSelectedNetwork(testnetDefault)
    } else if (!isTestnets && selectedNetwork !== mainnetDefault) {
      setSelectedNetwork(mainnetDefault)
    }
  }, [isTestnets])
}
