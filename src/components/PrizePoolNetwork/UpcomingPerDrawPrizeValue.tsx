import { CurrencyValue } from '@components/CurrencyValue'
import { useSelectedPrizePool } from '@hooks/v4/PrizePool/useSelectedPrizePool'
import { useUpcomingPrizeTier } from '@hooks/v4/PrizePool/useUpcomingPrizeTier'
import { usePrizePoolTokens } from '@pooltogether/hooks'
import { ethers } from 'ethers'
import { useExpectedUpcomingDailyPrizeValue } from '../../hooks/v4/PrizePool/useExpectedUpcomingDailyPrizeValue'

/**
 * TODO: Actually get token prices
 * @param props
 * @returns
 */
export const UpcomingPerDrawPrizeValue = (props) => {
  const prizePool = useSelectedPrizePool()
  const { data: tokens } = usePrizePoolTokens(prizePool)
  const prizeValue = useExpectedUpcomingDailyPrizeValue()

  return <CurrencyValue baseValue={prizeValue.amount} />
}
