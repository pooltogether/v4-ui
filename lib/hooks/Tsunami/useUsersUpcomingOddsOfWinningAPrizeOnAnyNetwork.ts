import { useUsersCurrentPrizePoolTwabs } from 'lib/hooks/Tsunami/PrizePool/useUsersCurrentPrizePoolTwabs'
import { useMemo } from 'react'
import { useUsersAddress } from '../useUsersAddress'
import { estimateOddsForAmount } from './useEstimatedOddsForAmount'
import { useTotalOddsData } from './useOddsData'

export const useUsersUpcomingOddsOfWinningAPrizeOnAnyNetwork = () => {
  const { data: twabs, isFetched: isTwabsFetched } = useUsersCurrentPrizePoolTwabs()
  const { data, isFetched: isOddsDataFetched } = useTotalOddsData()
  return useMemo(() => {
    if (!isOddsDataFetched || !isTwabsFetched) {
      return {
        isFetched: false,
        data: undefined
      }
    }
    const { numberOfPrizes, decimals, totalSupply } = data
    return {
      isFetched: true,
      data: estimateOddsForAmount(twabs.total, totalSupply, numberOfPrizes, decimals)
    }
  }, [
    isOddsDataFetched,
    isTwabsFetched,
    twabs?.total.amount,
    data?.numberOfPrizes,
    data?.decimals,
    data?.totalSupply
  ])
}
