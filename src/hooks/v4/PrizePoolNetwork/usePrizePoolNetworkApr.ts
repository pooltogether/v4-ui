import { NO_REFETCH } from '@constants/query'
import { useQuery } from 'react-query'
import { usePrizePoolNetworkTicketTwabTotalSupply } from './usePrizePoolNetworkTicketTwabTotalSupply'
import { usePrizePoolBySelectedChainId } from '../PrizePool/usePrizePoolBySelectedChainId'
import { useUpcomingPrizeTier } from '../PrizePool/useUpcomingPrizeTier'
import { formatUnits, parseUnits } from 'ethers/lib/utils'
import { usePrizePoolTokens } from '@pooltogether/hooks'
import { calculateApr } from '@pooltogether/utilities'

/**
 * NOTE: Assumes all networks award the same token.
 * NOTE: Assumes daily prize $ amount is consistent across all networks.
 * @returns
 */
export const usePrizePoolNetworkApr = () => {
  const prizePool = usePrizePoolBySelectedChainId()
  const { data: prizeTierData, isFetched: isPrizeConfigFetched } = useUpcomingPrizeTier(prizePool)
  const { data: tokenData, isFetched: isTokenDataFetched } = usePrizePoolTokens(prizePool)
  const { data: totalSupplyData, isFetched: isTotalSupplyFetched } =
    usePrizePoolNetworkTicketTwabTotalSupply()
  const enabled =
    isPrizeConfigFetched && isTotalSupplyFetched && !!prizeTierData.prizeTier && isTokenDataFetched
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
      ...NO_REFETCH,
      enabled
    }
  )
}
