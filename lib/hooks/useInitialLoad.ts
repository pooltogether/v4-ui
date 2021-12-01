import { useSelectedNetworkUser } from './Tsunami/User/useSelectedNetworkUser'
import { usePrizePoolTokens } from './Tsunami/PrizePool/usePrizePoolTokens'
import { usePrizePoolBySelectedNetwork } from './Tsunami/PrizePool/usePrizePoolBySelectedNetwork'

/**
 * Initial fetches required, regardless of the page loaded.
 * @returns isInitialized - a boolean to determine if the app has loaded the
 * core data required to render everything
 */
export const useInitialLoad = () => {
  useSelectedNetworkUser()
  const prizePool = usePrizePoolBySelectedNetwork()
  const { isFetched: isPrizePoolTokensFetched } = usePrizePoolTokens(prizePool)
  return isPrizePoolTokensFetched
}
