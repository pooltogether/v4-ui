import { DEFAULT_CHAIN_IDS, DEFAULT_PRIZE_POOLS } from '@constants/config'
import { CURRENCY_ID, SUPPORTED_CURRENCIES } from '@constants/currencies'
import { APP_ENVIRONMENTS, getStoredIsTestnetsCookie } from '@pooltogether/hooks'
import { PrizePool } from '@pooltogether/v4-client-js'
import { CHAIN_ID } from '@pooltogether/wallet-connection'
import { getAppEnv } from '@utils/getAppEnv'
import { parseUrlNetwork } from '@utils/parseUrlNetwork'
import { parseUrlPrizePoolAddress } from '@utils/parseUrlPrizePoolAddress'
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
 * TODO: set initial currency to match user's locale
 * TODO: check if value from localstorage is actually a valid currency ID
 * Initializes the currency used throughout the app.
 * Reads from localstorage if set, otherwise defaults to USD.
 */
const getInitialSelectedCurrencyId = () => {
  if (typeof window === 'undefined') return 'usd'
  const cachedCurrency = localStorage.getItem('selectedCurrency') as CURRENCY_ID
  if (!!cachedCurrency && Object.keys(SUPPORTED_CURRENCIES).includes(cachedCurrency)) {
    return cachedCurrency
  } else {
    return 'usd'
  }
}

/**
 *
 */
export const selectedPrizePoolAddressAtom = atom<string>(getInitialSelectedPrizePoolAddress())

/**
 *
 */
export const selectedPrizePoolAddressesAtom = atom<{ [chainId: number]: string }>(
  DEFAULT_PRIZE_POOLS[getAppEnv()]
)

/**
 *
 */
export const selectedCurrencyIdAtom = atom<CURRENCY_ID>(getInitialSelectedCurrencyId())

/**
 * Used to set the active prize pool in the app when a chain id changes
 */
export const setSelectedChainIdWriteAtom = atom<null, number>(null, (get, set, chainId) => {
  // Set in atom
  set(selectedChainIdAtom, chainId)
  // Update active prize pool address
  const selectedPrizePoolAddresses = get(selectedPrizePoolAddressesAtom)
  const selectedPrizePoolAddress = selectedPrizePoolAddresses[chainId]
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

    // Update active prize pool addresses
    const selectedPrizePoolAddresses = Object.assign({}, get(selectedPrizePoolAddressesAtom))
    selectedPrizePoolAddresses[chainId] = address
    set(selectedPrizePoolAddressesAtom, selectedPrizePoolAddresses)
  }
)

/**
 * Used to set the currency used when a new one is selected.
 */
export const setSelectedCurrencyIdWriteAtom = atom<null, CURRENCY_ID>(
  null,
  (get, set, currencyId) => {
    if (typeof window !== 'undefined') {
      // Set in atom
      set(selectedCurrencyIdAtom, currencyId)
      // Set in localstorage
      localStorage.setItem('selectedCurrency', currencyId)
    }
  }
)
