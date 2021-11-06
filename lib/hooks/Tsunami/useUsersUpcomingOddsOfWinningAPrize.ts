import { useUsersCurrentPrizePoolTwabs } from 'lib/hooks/Tsunami/PrizePool/useUsersCurrentPrizePoolTwabs'
import { useEstimatedOddsForDepositAmount } from './useEstimatedOddsForDepositAmount'

export const useUsersUpcomingOddsOfWinningAPrize = () => {
  const { data: twabs } = useUsersCurrentPrizePoolTwabs()
  return useEstimatedOddsForDepositAmount(twabs?.total)
}
