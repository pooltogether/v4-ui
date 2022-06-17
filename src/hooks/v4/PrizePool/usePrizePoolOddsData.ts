import { usePrizePoolTokens } from '@pooltogether/hooks'
import { PrizePool } from '@pooltogether/v4-client-js'
import { usePrizePoolTotalNumberOfPrizes } from './usePrizePoolTotalNumberOfPrizes'
import { usePrizePoolTicketTwabTotalSupply } from './usePrizePoolTicketTwabTotalSupply'

export const usePrizePoolOddsData = (prizePool: PrizePool) => {
  const { data: tokenData, isFetched: isTokenDataFetched } = usePrizePoolTokens(prizePool)
  const { data: ticketTwabTotalSupply, isFetched: isTicketTotalSupplyFetched } =
    usePrizePoolTicketTwabTotalSupply(prizePool)
  const { data: numberOfPrizes, isFetched: isTotalNumberOfPrizesFetched } =
    usePrizePoolTotalNumberOfPrizes(prizePool)

  const isFetched = isTokenDataFetched && isTicketTotalSupplyFetched && isTotalNumberOfPrizesFetched
  if (!isFetched) {
    return undefined
  }
  return {
    decimals: tokenData.ticket.decimals,
    totalSupply: ticketTwabTotalSupply.amount,
    numberOfPrizes
  }
}
