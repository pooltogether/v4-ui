import { PrizePool, TokenData } from '@pooltogether/v4-js-client'
import { TokenPrice, useCoingeckoTokenPrices } from '@pooltogether/hooks'
import { UseQueryResult } from 'react-query'

export const usePrizePoolTokenValue = (
  prizePool: PrizePool
): UseQueryResult<TokenPrice, unknown> => {
  const tokenAddress = prizePool?.tokenMetadata.address
  const chainId = prizePool?.chainId
  const response = useCoingeckoTokenPrices(chainId, [tokenAddress])
  return { ...response, data: response.data?.[tokenAddress] } as UseQueryResult<TokenPrice, unknown>
}
