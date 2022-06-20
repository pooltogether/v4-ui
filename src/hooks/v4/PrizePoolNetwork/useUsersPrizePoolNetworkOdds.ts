import { BigNumber, ethers } from 'ethers'
import { useUsersTotalTwab } from '@hooks/v4/PrizePool/useUsersTotalTwab'
import { EstimateAction, estimateOddsForAmount } from './usePrizePoolNetworkEstimatedOddsForAmount'
import { usePrizePoolNetworkOddsData } from './usePrizePoolNetworkOddsData'
import { useQuery } from 'react-query'
import { NO_REFETCH } from '@constants/query'

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
) => {
  const { data: twabs, isFetched: isTwabsFetched } = useUsersTotalTwab(usersAddress)
  const { data: oddsData, isFetched: isOddsDataFetched } = usePrizePoolNetworkOddsData()

  const isFetched = isTwabsFetched && isOddsDataFetched

  return useQuery(
    [
      'useUsersPrizePoolNetworkOdds',
      usersAddress,
      action,
      amountUnformatted?.toString(),
      twabs?.twab.amount,
      daysOfPrizes
    ],
    () => {
      console.log('useUsersPrizePoolNetworkOdds', { oddsData, twabs, daysOfPrizes })
      const { totalSupply, numberOfPrizes, decimals } = oddsData
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
    },
    {
      ...NO_REFETCH,
      enabled: isFetched
    }
  )
}
