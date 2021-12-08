import { useAllPrizePoolTokens } from './Tsunami/PrizePool/useAllPrizePoolTokens'

/**
 * Initial fetches required, regardless of the page loaded.
 * @returns isInitialized - a boolean to determine if the app has loaded the
 * core data required to render everything
 */
export const useInitialLoad = () => {
  const queryResults = useAllPrizePoolTokens()
  const isFetched = queryResults.every((queryResult) => queryResult.isFetched)
  return isFetched
}
