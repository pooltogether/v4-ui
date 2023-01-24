import { usePrizePoolTokens } from '@pooltogether/hooks'
import { calculateApr } from '@pooltogether/utilities'
import { formatUnits, parseUnits } from 'ethers/lib/utils'
import { useQuery } from 'react-query'
import { usePrizePoolNetworkTicketTwabTotalSupply } from './usePrizePoolNetworkTicketTwabTotalSupply'
import { useSelectedPrizePool } from '../PrizePool/useSelectedPrizePool'
import { useUpcomingPrizeTier } from '../PrizePool/useUpcomingPrizeTier'

/**
 * NOTE: Assumes all networks award the same token.
 * NOTE: Assumes daily prize $ amount is consistent across all networks.
 * @returns
 */
export const usePrizePoolNetworkApr = () => {
  const prizePool = useSelectedPrizePool()
  const { data: prizeTierData, isFetched: isPrizeTierFetched } = useUpcomingPrizeTier(prizePool)
  const { data: tokenData, isFetched: isTokenDataFetched } = usePrizePoolTokens(prizePool)
  const { data: totalSupplyData, isFetched: isTotalSupplyFetched } =
    usePrizePoolNetworkTicketTwabTotalSupply()
  const enabled =
    isPrizeTierFetched && isTotalSupplyFetched && !!prizeTierData.prizeTier && isTokenDataFetched
  return useQuery(
    ['usePrizePoolNetworkApr', prizeTierData?.prizeTier.prize.toString(), totalSupplyData],
    () => {
      const scaledTvl = parseUnits(
        formatUnits(totalSupplyData.totalSupply.amountUnformatted, totalSupplyData.decimals),
        tokenData.ticket.decimals
      )
      return calculateApr(scaledTvl, prizeTierData?.prizeTier.prize)
    },
    {
      enabled
    }
  )
}
