import { useConnectWallet } from '@pooltogether/wallet-connection'
import { useConnect } from 'wagmi'
import { useAllPrizePoolTokens } from './v4/PrizePool/useAllPrizePoolTokens'
import { usePrizePools } from './v4/PrizePool/usePrizePools'

/**
 * Initial fetches required, regardless of the page loaded.
 * @returns isInitialized - a boolean to determine if the app has loaded the
 * core data required to render everything
 */
export const useInitialLoad = () => {
  const queryResults = useAllPrizePoolTokens()
  const { status } = useConnect()
  const isFetched = queryResults.every((queryResult) => queryResult.isFetched)
  return isFetched && status !== 'reconnecting' && status !== 'connecting'
}
