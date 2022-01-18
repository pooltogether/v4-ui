import { PrizePool } from '@pooltogether/v4-js-client'
import { getAmountFromBigNumber } from 'lib/utils/getAmountFromBigNumber'
import { usePrizePoolTicketTotalSupply } from './PrizePool/usePrizePoolTicketTotalSupply'
import { useTicketDecimals } from './PrizePool/useTicketDecimals'
import { getNumberOfPrizes } from './useOverallOddsData'

export const useOddsData = (prizePool: PrizePool) => {
  const { data: ticketDecimals, isFetched: isTicketDecimalsFetched } = useTicketDecimals()
  const { data: ticketTotalSupplyUnformatted, isFetched: isTicketTotalSupplyFetched } =
    usePrizePoolTicketTotalSupply(prizePool)

  const isFetched = isTicketDecimalsFetched && isTicketTotalSupplyFetched
  if (!isFetched) {
    return undefined
  }
  return {
    decimals: ticketDecimals,
    totalSupply: getAmountFromBigNumber(ticketTotalSupplyUnformatted, ticketDecimals),
    numberOfPrizes: getNumberOfPrizesPerPrizePool()
  }
}

export const getNumberOfPrizesPerPrizePool = () => {
  return getNumberOfPrizes() / 2
}
