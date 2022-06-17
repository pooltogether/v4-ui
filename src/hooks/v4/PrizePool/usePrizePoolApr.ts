import { NO_REFETCH } from '@constants/query'
import { useQuery } from 'react-query'
import { calculateApr } from '@utils/calculateApr'
import { PrizePool } from '@pooltogether/v4-client-js'
import { usePrizePoolTicketTwabTotalSupply } from './usePrizePoolTicketTwabTotalSupply'
import { usePrizeDistributorByChainId } from '../PrizeDistributor/usePrizeDistributorByChainId'
import { usePrizePoolTokens } from '@pooltogether/hooks'
import { usePrizePoolPercentageOfPicks } from './usePrizePoolPercentageOfPicks'
import { BigNumber } from 'ethers'
import { parseUnits } from 'ethers/lib/utils'
import { useUpcomingPrizeTier } from './useUpcomingPrizeTier'

/**
 * TODO: WIP FINISH THIS
 * @returns
 */
export const usePrizePoolApr = (prizePool: PrizePool) => {
  const { data: prizeTierData, isFetched: isPrizeConfigFetched } = useUpcomingPrizeTier(prizePool)
  const { data: tokenData, isFetched: isTokenDataFetched } = usePrizePoolTokens(prizePool)
  const { data: ticketTwabTotalSupply, isFetched: isTotalSupplyFetched } =
    usePrizePoolTicketTwabTotalSupply(prizePool)
  const { data: percentage, isFetched: isPercentageFetched } =
    usePrizePoolPercentageOfPicks(prizePool)

  const enabled =
    isPrizeConfigFetched &&
    isTotalSupplyFetched &&
    !!prizeTierData.prizeTier &&
    isTokenDataFetched &&
    isPercentageFetched

  return useQuery(
    ['usePrizePoolApr', prizeTierData?.prizeTier, ticketTwabTotalSupply?.amount],
    () => {
      // TODO: Need to do this bignumber math

      console.log({ BigNumber, prize: prizeTierData.prizeTier.prize, percentage })
      const a = prizeTierData.prizeTier.prize.mul(parseUnits(percentage.toString(), 2))
      const b = a.div(100)
      console.log({ a, astr: a.toString(), b, bstr: b.toString() })

      // const scaledDailyPrize = BigNumber.from(Math.round())
      return calculateApr(ticketTwabTotalSupply.amount, tokenData.ticket.decimals, b)
    },
    {
      ...NO_REFETCH,
      enabled
    }
  )
}
