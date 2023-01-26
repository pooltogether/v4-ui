import { getAmountFromUnformatted } from '@pooltogether/utilities'
import { BigNumber } from 'ethers'
import { useMemo } from 'react'
import { useAllPrizePoolExpectedPrizes } from './useAllPrizePoolExpectedPrizes'

/**
 * NOTE: Assumes the same decimals for all Prize Pools
 * @returns
 */
export const useExpectedUpcomingDailyPrizeValue = () => {
  const queryResults = useAllPrizePoolExpectedPrizes()

  return useMemo(() => {
    const decimals = queryResults[0]?.data?.decimals
    if (!decimals) {
      return getAmountFromUnformatted(BigNumber.from(0), '0')
    }
    return getAmountFromUnformatted(
      queryResults
        .filter(({ isFetched, isError }) => !!isFetched && !isError)
        .reduce(
          (total, { data }) => total.add(data.expectedTotalValueOfPrizes.amountUnformatted),
          BigNumber.from(0)
        ),
      decimals
    )
  }, [queryResults])
}
