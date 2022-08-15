import { Amount } from '@pooltogether/hooks'
import { PrizePool } from '@pooltogether/v4-client-js'
import { usePrizePoolTotalNumberOfPrizes } from '../PrizePool/usePrizePoolTotalNumberOfPrizes'
import { usePrizePoolTicketTwabTotalSupply } from '../PrizePool/usePrizePoolTicketTwabTotalSupply'
import { BigNumber, ethers } from 'ethers'
import { useQuery } from 'react-query'
import { EstimateAction } from '../../../constants/odds'
import { usePrizePoolTokens } from '@hooks/v4/PrizePool/usePrizePoolTokens'

export const getPrizePoolOddsDataKey = (
  prizePool: PrizePool,
  ticketTwabTotalSupply: string,
  numberOfPrizes: number,
  action: EstimateAction = EstimateAction.none,
  changeAmountUnformatted: string
) => [
  'usePrizePoolOddsData',
  prizePool?.id(),
  ticketTwabTotalSupply,
  numberOfPrizes,
  action,
  changeAmountUnformatted
]

export const usePrizePoolOddsData = (
  prizePool: PrizePool,
  action: EstimateAction = EstimateAction.none,
  changeAmountUnformatted: BigNumber = ethers.constants.Zero
) => {
  const { data: tokenData, isFetched: isTokenDataFetched } = usePrizePoolTokens(prizePool)
  const { data: ticketTwabTotalSupply, isFetched: isTicketTotalSupplyFetched } =
    usePrizePoolTicketTwabTotalSupply(prizePool)
  const { data: numberOfPrizesData, isFetched: isTotalNumberOfPrizesFetched } =
    usePrizePoolTotalNumberOfPrizes(prizePool)

  const isFetched = isTokenDataFetched && isTicketTotalSupplyFetched && isTotalNumberOfPrizesFetched

  return useQuery(
    getPrizePoolOddsDataKey(
      prizePool,
      ticketTwabTotalSupply?.amount.amount,
      numberOfPrizesData?.numberOfPrizes,
      action,
      changeAmountUnformatted?.toString()
    ),
    () =>
      getPrizePoolOddsData(
        prizePool,
        tokenData?.ticket.decimals,
        ticketTwabTotalSupply?.amount,
        numberOfPrizesData?.numberOfPrizes
      ),
    { enabled: isFetched }
  )
}

// TODO: Take action on total supply so calculations are accurate
export const getPrizePoolOddsData = (
  prizePool: PrizePool,
  decimals: string,
  totalSupply: Amount,
  numberOfPrizes: number,
  action: EstimateAction = EstimateAction.none,
  changeAmountUnformatted: BigNumber = ethers.constants.Zero
) => {
  return {
    prizePoolId: prizePool.id(),
    decimals,
    totalSupply,
    numberOfPrizes
  }
}
