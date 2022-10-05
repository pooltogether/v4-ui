import { V4_PRIZE_POOLS } from '@constants/config'
import { URL_QUERY_KEY } from '@constants/urlQueryKeys'
import { getInitialSelectedChainId } from '../atoms'
import { getAppEnv } from './getAppEnv'

export const parseUrlPrizePoolAddress = () => {
  const url = new URL(window.location.href)
  const urlPrizePoolAddress = url.searchParams.get(URL_QUERY_KEY.prizePool)?.toLowerCase()
  if (!urlPrizePoolAddress) return null

  const chainId = getInitialSelectedChainId()
  const prizePoolAddresses = V4_PRIZE_POOLS[getAppEnv()][chainId]
  if (prizePoolAddresses.includes(urlPrizePoolAddress)) {
    return urlPrizePoolAddress
  }

  return null
}
