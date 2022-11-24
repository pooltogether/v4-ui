import { Amount } from '@pooltogether/hooks'
import { getAmount } from '@pooltogether/utilities'
import { ethers } from 'ethers'
import { useMemo } from 'react'
import { useAllPrizePoolOdds } from '../PrizePool/useAllPrizePoolOdds'
import { usePrizePools } from '../PrizePool/usePrizePools'
import { usePrizePoolNetworkOdds } from './usePrizePoolNetworkOdds'

/**
 * Calculates the users overall chances of winning a prize on any network
 * @param amount amount to estimate odds for
 * @param prizePoolId the prize pool to estimate odds for
 * @returns
 */
export const useSpoofedPrizePoolNetworkOdds = (
  amount: string,
  decimals: string,
  prizePoolId: string
) => {
  const prizePools = usePrizePools()
  const queryResults = useAllPrizePoolOdds(
    !!amount && !!decimals && !!prizePoolId
      ? prizePools.reduce((twabs, prizePool) => {
          if (prizePool.id() === prizePoolId) {
            twabs[prizePool.id()] = getAmount(amount, decimals)
          } else {
            twabs[prizePool.id()] = getAmount(ethers.constants.Zero, '0')
          }

          return twabs
        }, {} as { [prizePoolId: string]: Amount })
      : {}
  )
  const allOddsData = useMemo(
    () =>
      queryResults
        .filter(({ isFetched, isError }) => isFetched && !isError)
        .map(({ data }) => data),
    [queryResults]
  )
  return usePrizePoolNetworkOdds(allOddsData)
}
