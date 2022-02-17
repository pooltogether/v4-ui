import { useRouter } from 'next/router'
import { useEffect } from 'react'
import { atom, useAtom } from 'jotai'
import { APP_ENVIRONMENTS, getStoredIsTestnetsCookie, useIsTestnets } from '@pooltogether/hooks'

import { URL_QUERY_KEY } from '@constants/urlQueryKeys'
import { DEFAULT_CHAIN_IDS, SUPPORTED_CHAIN_IDS, SUPPORTED_CHAIN_NAMES } from '@constants/config'
import { CHAIN_ID } from '@constants/misc'
import { getChainIdByAlias, getNetworkNameAliasByChainId } from '@pooltogether/utilities'

const parseUrlNetwork = () => {
  const url = new URL(window.location.href)
  const urlNetwork = url.searchParams.get(URL_QUERY_KEY.network)?.toLowerCase()

  const appEnv = getStoredIsTestnetsCookie() ? APP_ENVIRONMENTS.testnets : APP_ENVIRONMENTS.mainnets
  const supportedChainIds = SUPPORTED_CHAIN_IDS[appEnv]
  const supportedChainNames = SUPPORTED_CHAIN_NAMES[appEnv]

  if (!urlNetwork) return null
  if (supportedChainNames.includes(urlNetwork)) {
    return getChainIdByAlias(urlNetwork)
  }

  try {
    const urlChainId = Number(urlNetwork)
    if (supportedChainIds.includes(urlChainId)) {
      return urlChainId
    }
    return null
  } catch (e) {
    console.warn(`Invalid network id ${urlNetwork}`)
    return null
  }
}

/**
 * Initializes the selected network atom.
 * Reads from the app environment & the URL to set the proper
 * initial selected network
 */
const getInitialSelectedChainId = () => {
  if (typeof window === 'undefined') return CHAIN_ID.mainnet

  const appEnv = getStoredIsTestnetsCookie() ? APP_ENVIRONMENTS.testnets : APP_ENVIRONMENTS.mainnets
  const defaultChainId = DEFAULT_CHAIN_IDS[appEnv]

  const chainId = parseUrlNetwork()
  if (Boolean(chainId)) {
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
  const [selectedNetwork] = useAtom(selectedNetworkAtom)
  const router = useRouter()

  // Watch for atom changes
  useEffect(() => {
    const queryParamNetwork = parseUrlNetwork()
    if (selectedNetwork !== queryParamNetwork) {
      const url = new URL(window.location.href)
      url.searchParams.set(URL_QUERY_KEY.network, getNetworkNameAliasByChainId(selectedNetwork))
      router.replace(url, null, { scroll: false })
    }
  }, [selectedNetwork])

  // TODO: Fix this so it doesn't interfere with the inital set.
  // Commented out since we're just refreshing the page for the time being.
  //
  // Watch for testnet changes
  // useEffect(() => {
  //   console.log('Watch for testnet changes')
  //   const testnetDefault = DEFAULT_CHAIN_IDS[APP_ENVIRONMENTS.testnets]
  //   const mainnetDefault = DEFAULT_CHAIN_IDS[APP_ENVIRONMENTS.mainnets]
  //   if (isTestnets && selectedNetwork !== testnetDefault) {
  //     setSelectedNetwork(testnetDefault)
  //   } else if (!isTestnets && selectedNetwork !== mainnetDefault) {
  //     setSelectedNetwork(mainnetDefault)
  //   }
  // }, [isTestnets])
}
