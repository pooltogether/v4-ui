import { TokenPrice, useCoingeckoTokenPrices } from '@pooltogether/hooks'
import { PrizePool } from '@pooltogether/v4-client-js'
import { UseQueryResult } from 'react-query'
import { usePrizePoolTokens } from './usePrizePoolTokens'

export const usePrizePoolTokenValue = (
  prizePool: PrizePool
): UseQueryResult<TokenPrice, unknown> => {
  const { data: tokens } = usePrizePoolTokens(prizePool)
  const chainId = prizePool?.chainId
  const response = useCoingeckoTokenPrices(chainId, [tokens?.token.address])
  return { ...response, data: response.data?.[tokens?.token.address] } as UseQueryResult<
    TokenPrice,
    unknown
  >
}
