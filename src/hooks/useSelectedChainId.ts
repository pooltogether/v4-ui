import { DEFAULT_CHAIN_IDS, SUPPORTED_CHAIN_IDS, SUPPORTED_CHAIN_NAMES } from '@constants/config'
import { URL_QUERY_KEY } from '@constants/urlQueryKeys'
import { APP_ENVIRONMENTS, getStoredIsTestnetsCookie } from '@pooltogether/hooks'
import { getChainIdByAlias } from '@pooltogether/utilities'
import { CHAIN_ID } from '@pooltogether/wallet-connection'
import { atom, useAtom, useSetAtom } from 'jotai'
import { useQueryParamState } from './useQueryParamState'
import {
  selectedChainIdAtom,
  selectedPrizePoolAddressesAtom,
  setSelectedChainIdWriteAtom
} from '../atoms'

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
  const [chainId] = useAtom(selectedChainIdAtom)
  const setSelectedChainId = useSetAtom(setSelectedChainIdWriteAtom)
  return {
    chainId,
    setSelectedChainId
  }
}
