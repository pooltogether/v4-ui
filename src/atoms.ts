import { DEFAULT_CHAIN_IDS, DEFAULT_PRIZE_POOLS } from '@constants/config'
import { URL_QUERY_KEY } from '@constants/urlQueryKeys'
import { APP_ENVIRONMENTS, getStoredIsTestnetsCookie } from '@pooltogether/hooks'
import { getNetworkNameAliasByChainId } from '@pooltogether/utilities'
import { PrizePool } from '@pooltogether/v4-client-js'
import { CHAIN_ID } from '@pooltogether/wallet-connection'
import { getAppEnv } from '@utils/getAppEnv'
import { parseUrlNetwork } from '@utils/parseUrlNetwork'
import { parseUrlPrizePoolAddress } from '@utils/parseUrlPrizePoolAddress'
import { setQueryParam } from '@utils/setQueryParam'
import { atom } from 'jotai'

/**
 * Initializes the selected network atom.
 * Reads from the app environment & the URL to set the proper
 * initial selected network
 */
export const getInitialSelectedChainId = () => {
  if (typeof window === 'undefined') return CHAIN_ID.mainnet

  const appEnv = getStoredIsTestnetsCookie() ? APP_ENVIRONMENTS.testnets : APP_ENVIRONMENTS.mainnets
  const defaultChainId = DEFAULT_CHAIN_IDS[appEnv]

  const chainId = parseUrlNetwork()
  if (Boolean(chainId)) {
    return chainId
  }
  return defaultChainId
}

/**
 * Used to identify the active chain id in the app
 */
export const selectedChainIdAtom = atom<number>(getInitialSelectedChainId())

/**
 * Initializes the selected network atom.
 * Reads from the app environment & the URL to set the proper
 * initial selected network
 */
const getInitialSelectedPrizePoolAddress = () => {
  const chainId = getInitialSelectedChainId()
  const defaultPrizePoolAddress: string = DEFAULT_PRIZE_POOLS[getAppEnv()][chainId]

  if (typeof window === 'undefined') return defaultPrizePoolAddress

  const prizePoolAddress = parseUrlPrizePoolAddress()
  if (!!prizePoolAddress) {
    return prizePoolAddress
  }
  return defaultPrizePoolAddress
}

/**
 *
 */
export const selectedPrizePoolAddressAtom = atom<string>(getInitialSelectedPrizePoolAddress())

/**
 *
 */
const selectedPrizePoolAddressesAtom = atom<{ [chainId: number]: string }>(
  DEFAULT_PRIZE_POOLS[getAppEnv()]
)

/**
 * Used to set the active prize pool in the app when a chain id changes
 */
export const setSelectedChainIdWriteAtom = atom<null, number>(null, (get, set, chainId) => {
  // Set in atom
  set(selectedChainIdAtom, chainId)
  // Update url query param
  setQueryParam(URL_QUERY_KEY.network, getNetworkNameAliasByChainId(chainId))
  // Update active prize pool address
  const selectedPrizePoolAddresses = get(selectedPrizePoolAddressesAtom)
  const selectedPrizePoolAddress = selectedPrizePoolAddresses[chainId]
  setQueryParam(URL_QUERY_KEY.prizePool, selectedPrizePoolAddress)
  set(selectedPrizePoolAddressAtom, selectedPrizePoolAddress)
})

/**
 * Used to set the active prize pool in the app when a chain id changes
 */
export const setSelectedPrizePoolWriteAtom = atom<null, PrizePool>(
  null,
  (get, set, { chainId, address }) => {
    // Set in atoms
    set(selectedPrizePoolAddressAtom, address)
    set(selectedChainIdAtom, chainId)
    // Update url query param
    setQueryParam(URL_QUERY_KEY.prizePool, address)
    setQueryParam(URL_QUERY_KEY.network, getNetworkNameAliasByChainId(chainId))
    // Update active prize pool addresses
    const selectedPrizePoolAddresses = Object.assign({}, get(selectedPrizePoolAddressesAtom))
    selectedPrizePoolAddresses[chainId] = address
    set(selectedPrizePoolAddressesAtom, selectedPrizePoolAddresses)
  }
)
