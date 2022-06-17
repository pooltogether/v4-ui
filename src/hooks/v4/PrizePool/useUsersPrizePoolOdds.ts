import { BigNumber, ethers } from 'ethers'
import { useMemo } from 'react'
import {
  EstimateAction,
  estimateOddsForAmount
} from '../PrizePoolNetwork/usePrizePoolNetworkEstimatedOddsForAmount'
import { usePrizePoolOddsData } from './usePrizePoolOddsData'
import { PrizePool } from '@pooltogether/v4-client-js'
import { useUsersPrizePoolTwab } from './useUsersPrizePoolTwab'

/**
 * Calculates the users overall chances of winning a prize on any network
 * @param action
 * @param amountUnformatted
 * @returns
 */
export const useUsersPrizePoolOdds = (
  usersAddress: string,
  prizePool: PrizePool,
  action: EstimateAction = EstimateAction.none,
  amountUnformatted: BigNumber = ethers.constants.Zero,
  daysOfPrizes: number = 1
): {
  usersAddress: string
  odds: number
  oneOverOdds: number
} => {
  const { data: twabData, isFetched: isTwabsFetched } = useUsersPrizePoolTwab(
    usersAddress,
    prizePool
  )
  const data = usePrizePoolOddsData(prizePool)
  return useMemo(() => {
    if (!isTwabsFetched || !data || !twabData) {
      return undefined
    }
    const { totalSupply, numberOfPrizes, decimals } = data
    const { odds, oneOverOdds } = estimateOddsForAmount(
      twabData.twab,
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
    twabData?.twab.amount,
    action,
    amountUnformatted,
    daysOfPrizes
  ])
}
