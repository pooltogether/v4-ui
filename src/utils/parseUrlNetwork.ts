import { SUPPORTED_CHAIN_IDS, SUPPORTED_CHAIN_NAMES } from '@constants/config'
import { URL_QUERY_KEY } from '@constants/urlQueryKeys'
import { APP_ENVIRONMENTS, getStoredIsTestnetsCookie } from '@pooltogether/hooks'
import { getChainIdByAlias } from '@pooltogether/utilities'

export const parseUrlNetwork = () => {
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
