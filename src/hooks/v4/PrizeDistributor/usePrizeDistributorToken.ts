import { Token } from '@pooltogether/hooks'
import { PrizeDistributorV2 } from '@pooltogether/v4-client-js'
import { NO_REFETCH } from '@constants/query'
import { useQuery } from 'react-query'

export const PRIZE_DISTRIBUTOR_TOKEN_QUERY_KEY = 'usePrizeDistributorToken'

export const usePrizeDistributorToken = (prizeDistributor: PrizeDistributorV2) => {
  return useQuery(
    [PRIZE_DISTRIBUTOR_TOKEN_QUERY_KEY, prizeDistributor?.id()],
    async () => getPrizeDistributorToken(prizeDistributor),
    { ...NO_REFETCH }
  )
}

export const getPrizeDistributorToken = async (
  prizeDistributor: PrizeDistributorV2
): Promise<{
  prizeDistributorId: string
  token: Token
}> => {
  const tokenData = await prizeDistributor.getTokenData()
  const tokenContract = await prizeDistributor.getTokenContract()

  const token: Token = {
    address: tokenContract.address,
    symbol: tokenData.symbol,
    name: tokenData.name,
    decimals: tokenData.decimals
  }

  return {
    prizeDistributorId: prizeDistributor.id(),
    token
  }
}
