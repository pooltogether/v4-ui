import { atom, useAtom } from 'jotai'

import { URL_QUERY_KEY } from '@constants/urlQueryKeys'
import { DEFAULT_CHAIN_IDS, SUPPORTED_CHAIN_IDS, SUPPORTED_CHAIN_NAMES } from '@constants/config'
import { CHAIN_ID } from '@constants/misc'
import { getChainIdByAlias } from '@pooltogether/utilities'
import { getAppEnv } from '@utils/getAppEnv'

export const parseUrlNetwork = () => {
  const url = new URL(window.location.href)
  const urlNetwork = url.searchParams.get(URL_QUERY_KEY.network)?.toLowerCase()

  const appEnv = getAppEnv()
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
export const getInitialSelectedChainId = () => {
  if (typeof window === 'undefined') return CHAIN_ID.mainnet

  const appEnv = getAppEnv()
  const defaultChainId = DEFAULT_CHAIN_IDS[appEnv]

  const chainId = parseUrlNetwork()
  if (Boolean(chainId)) {
    return chainId
  }
  return defaultChainId
}

const selectedNetworkAtom = atom<number>(getInitialSelectedChainId())

export const useSelectedChainId = () => {
  const [chainId, setSelectedChainId] = useAtom(selectedNetworkAtom)
  return { chainId, setSelectedChainId }
}
