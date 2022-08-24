import { useConnect } from 'wagmi'
import { useActualFullScreen } from './useActualFullScreen'
import { useAllPrizePoolTokens } from './v4/PrizePool/useAllPrizePoolTokens'

/**
 * Initial fetches required, regardless of the page loaded.
 * @returns isInitialized - a boolean to determine if the app has loaded the
 * core data required to render everything
 */
export const useInitialLoad = () => {
  useActualFullScreen()
  const queryResults = useAllPrizePoolTokens()
  const { status } = useConnect()
  const isFetched = queryResults.every((queryResult) => queryResult.isFetched)
  return isFetched // && status !== 'reconnecting' && status !== 'connecting'
}
