import { atom, useAtom } from 'jotai'

import { URL_QUERY_KEY } from '@constants/urlQueryKeys'
import { DEFAULT_PRIZE_POOLS, V4_PRIZE_POOLS } from '@constants/config'
import { getInitialSelectedChainId } from './useSelectedChainId'
import { getAppEnv } from '@utils/getAppEnv'

const parseUrlPrizePoolAddress = () => {
  const url = new URL(window.location.href)
  const urlPrizePoolAddress = url.searchParams.get(URL_QUERY_KEY.prizePool)?.toLowerCase()
  if (!urlPrizePoolAddress) return null

  const chainId = getInitialSelectedChainId()
  const prizePoolAddresses = V4_PRIZE_POOLS[chainId]
  if (prizePoolAddresses.includes(urlPrizePoolAddress)) {
    return urlPrizePoolAddress
  }

  return null
}

/**
 * Initializes the selected network atom.
 * Reads from the app environment & the URL to set the proper
 * initial selected network
 */
const getInitialSelectedPrizePoolAddress = () => {
  const chainId = getInitialSelectedChainId()
  const defaultPrizePoolAddress = DEFAULT_PRIZE_POOLS[getAppEnv()][chainId]

  if (typeof window === 'undefined') return defaultPrizePoolAddress

  const prizePoolAddress = parseUrlPrizePoolAddress()
  if (Boolean(prizePoolAddress)) {
    return prizePoolAddress
  }
  return defaultPrizePoolAddress
}

const selectedPrizePoolAddressAtom = atom<string>(getInitialSelectedPrizePoolAddress())

export const useSelectedPrizePoolAddress = () => {
  const [prizePoolAddress, setSelectedPrizePoolAddress] = useAtom(selectedPrizePoolAddressAtom)
  return { prizePoolAddress, setSelectedPrizePoolAddress }
}
