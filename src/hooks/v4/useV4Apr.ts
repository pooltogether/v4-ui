import { useUpcomingPrizeConfig } from '@hooks/useUpcomingPrizeConfig'
import { Amount } from '@pooltogether/hooks'
import { NO_REFETCH } from '@constants/query'
import { BigNumber } from 'ethers'
import { useQuery } from 'react-query'
import { usePrizePoolNetworkTicketTwabTotalSupply } from './PrizePool/usePrizePoolNetworkTicketTwabTotalSupply'

export const useV4Apr = () => {
  const { data: prizeConfig, isFetched: isPrizeConfigFetched } = useUpcomingPrizeConfig()
  const { data: totalSupply, isFetched: isTotalSupplyFetched } =
    usePrizePoolNetworkTicketTwabTotalSupply()
  const enabled = isPrizeConfigFetched && isTotalSupplyFetched && !!prizeConfig
  return useQuery(
    ['useV4Apr', prizeConfig, totalSupply],
    () => getV4Apr(totalSupply, prizeConfig.prize),
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
