import { useUpcomingPrizeTier } from '@hooks/useUpcomingPrizeTier'
import { Amount } from '@pooltogether/hooks'
import { NO_REFETCH } from '@pooltogether/hooks/dist/constants'
import { BigNumber } from 'ethers'
import { useQuery } from 'react-query'
import { usePrizePoolNetworkTicketTwabTotalSupply } from './PrizePool/usePrizePoolNetworkTicketTwabTotalSupply'

export const useV4Apr = () => {
  const { data: prizeTier, isFetched: isPrizeTierFetched } = useUpcomingPrizeTier()
  const { data: totalSupplyData, isFetched: isTotalSupplyFetched } =
    usePrizePoolNetworkTicketTwabTotalSupply()
  const enabled = isPrizeTierFetched && isTotalSupplyFetched
  return useQuery(
    ['useV4Apr', prizeTier, totalSupplyData?.totalSupply.amountPretty],
    () => getV4Apr(totalSupplyData.totalSupply, prizeTier.prize),
    {
      ...NO_REFETCH,
      enabled
    }
  )
}

const getV4Apr = async (totalSupply: Amount, dailyPrizeAmountUnformatted: BigNumber) => {
  const totalYearlyPrizesUnformatted = dailyPrizeAmountUnformatted.mul(365)

  const totalTotalSupply = Number(totalSupply.amount)
  const totalYearlyPrizes = totalYearlyPrizesUnformatted.div(1e6).toNumber()

  return ((totalYearlyPrizes / totalTotalSupply) * 100).toFixed(2)
}
