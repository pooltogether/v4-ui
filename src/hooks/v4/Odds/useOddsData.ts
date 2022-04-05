import { PrizePool } from '@pooltogether/v4-client-js'
import { getAmountFromBigNumber } from '@utils/getAmountFromBigNumber'
import { usePrizePoolTicketTotalSupply } from './PrizePool/usePrizePoolTicketTotalSupply'
import { useSelectedPrizePoolTicketDecimals } from './PrizePool/useSelectedPrizePoolTicketDecimals'
import { getNumberOfPrizes } from './useOverallOddsData'

export const useOddsData = (prizePool: PrizePool) => {
  const { data: ticketDecimals, isFetched: isTicketDecimalsFetched } =
    useSelectedPrizePoolTicketDecimals()
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
