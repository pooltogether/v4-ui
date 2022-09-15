import { useInitCookieOptions } from '@pooltogether/hooks'
import { useUpdateStoredPendingTransactions } from '@pooltogether/wallet-connection'
import { useConnect } from 'wagmi'

import { useAllPrizePoolTokens } from './v4/PrizePool/useAllPrizePoolTokens'

/**
 * Initial fetches required, regardless of the page loaded.
 * @returns isInitialized - a boolean to determine if the app has loaded the
 * core data required to render everything
 */
export const useInitialLoad = () => {
  useUpdateStoredPendingTransactions()
  useInitCookieOptions(process.env.NEXT_PUBLIC_DOMAIN_NAME)
  const queryResults = useAllPrizePoolTokens()
  const { status } = useConnect()
  const isFetched = queryResults.every((queryResult) => queryResult.isFetched)
  return isFetched && status !== 'success' && status !== 'loading'
}
