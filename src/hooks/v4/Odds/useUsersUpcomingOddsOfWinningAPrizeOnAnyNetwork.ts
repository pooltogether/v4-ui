import { BigNumber, ethers } from 'ethers'
import { useUsersTotalTwab } from '@hooks/v4/PrizePool/useUsersTotalTwab'
import { EstimateAction, estimateOddsForAmount } from './useEstimatedOddsForAmount'
import { useOverallOddsData } from './useOverallOddsData'
import { useMemo } from 'react'

/**
 * Calculates hte users overall chances of winning a prize on any network
 * @param action
 * @param amountUnformatted
 * @returns
 */
export const useUsersUpcomingOddsOfWinningAPrizeOnAnyNetwork = (
  usersAddress: string,
  action: EstimateAction = EstimateAction.none,
  amountUnformatted: BigNumber = ethers.constants.Zero,
  daysOfPrizes: number = 1
): {
  usersAddress: string
  odds: number
  oneOverOdds: number
} => {
  const { data: twabs, isFetched: isTwabsFetched } = useUsersTotalTwab(usersAddress)
  const data = useOverallOddsData()
  return useMemo(() => {
    if (!isTwabsFetched || !data || !twabs) {
      return undefined
    }
    const { totalSupply, numberOfPrizes, decimals } = data
    const { odds, oneOverOdds } = estimateOddsForAmount(
      twabs.twab,
      totalSupply,
      numberOfPrizes * daysOfPrizes,
      decimals,
      action,
      amountUnformatted
    )
    console.log('hey')
    return {
      usersAddress,
      odds,
      oneOverOdds
    }
  }, [
    data?.decimals,
    data?.numberOfPrizes,
    data?.totalSupply.amount,
    twabs?.twab.amount,
    action,
    amountUnformatted,
    daysOfPrizes
  ])
}
