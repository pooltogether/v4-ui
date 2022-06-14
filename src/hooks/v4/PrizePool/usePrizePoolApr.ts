import { useUpcomingPrizeConfig } from '@hooks/v4/PrizeDistributor/useUpcomingPrizeConfig'
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

/**
 * TODO: WIP FINISH THIS
 * @returns
 */
export const usePrizePoolApr = (prizePool: PrizePool) => {
  const prizeDistributor = usePrizeDistributorByChainId(prizePool?.chainId)
  const { data: prizeConfigData, isFetched: isPrizeConfigFetched } =
    useUpcomingPrizeConfig(prizeDistributor)
  const { data: tokenData, isFetched: isTokenDataFetched } = usePrizePoolTokens(prizePool)
  const { data: ticketTwabTotalSupply, isFetched: isTotalSupplyFetched } =
    usePrizePoolTicketTwabTotalSupply(prizePool)
  const { data: percentage, isFetched: isPercentageFetched } =
    usePrizePoolPercentageOfPicks(prizePool)

  const enabled =
    isPrizeConfigFetched &&
    isTotalSupplyFetched &&
    !!prizeConfigData.prizeConfig &&
    isTokenDataFetched &&
    isPercentageFetched

  return useQuery(
    ['usePrizePoolApr', prizeConfigData?.prizeConfig, ticketTwabTotalSupply?.amount],
    () => {
      // TODO: Need to do this bignumber math

      console.log({ BigNumber, prize: prizeConfigData.prizeConfig.prize, percentage })
      const a = prizeConfigData.prizeConfig.prize.mul(parseUnits(percentage.toString(), 2))
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
