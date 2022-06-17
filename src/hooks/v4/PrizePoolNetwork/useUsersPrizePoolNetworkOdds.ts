import { BigNumber, ethers } from 'ethers'
import { useUsersTotalTwab } from '@hooks/v4/PrizePool/useUsersTotalTwab'
import { EstimateAction, estimateOddsForAmount } from './usePrizePoolNetworkEstimatedOddsForAmount'
import { usePrizePoolNetworkOddsData } from './usePrizePoolNetworkOddsData'
import { useMemo } from 'react'

/**
 * Calculates the users overall chances of winning a prize on any network
 * @param action
 * @param amountUnformatted
 * @returns
 */
export const useUsersPrizePoolNetworkOdds = (
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
  const data = usePrizePoolNetworkOddsData()
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
