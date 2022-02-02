import { useCoingeckoTokenPrices, useTokenBalances } from '@pooltogether/hooks'
import { calculateLPTokenPrice } from '@pooltogether/utilities'
import { formatUnits } from '@ethersproject/units'
import { LP_PRIZE_POOL_METADATA } from 'lib/constants/v3'
import { V3PrizePool } from './useV3PrizePools'

/**
 * NOTE: Relies on constants for getting tokens in the LP pair so we can start fetching the token prices faster & use the coingecko token price cache
 * @param prizePool
 * @returns
 */
export const useLPTokenUsdValue = (prizePool: V3PrizePool) => {
  const lpPrizePoolMetadata = getLPPrizePoolMetadata(prizePool)

  const lpTokenAddress = lpPrizePoolMetadata.tokens.underlyingToken.address
  const token1Address = lpPrizePoolMetadata.tokens.underlyingToken.token1.address
  const token2Address = lpPrizePoolMetadata.tokens.underlyingToken.token2.address

  const { data: tokenPrices, isFetched: isTokenPricesFetched } = useCoingeckoTokenPrices(
    prizePool.chainId,
    [token1Address, token2Address]
  )

  const { data: lPTokenBalances, isFetched: tokenBalancesIsFetched } = useTokenBalances(
    prizePool.chainId,
    lpPrizePoolMetadata.tokens.underlyingToken.address,
    [token1Address, token2Address, lpTokenAddress]
  )

  const isFetched = isTokenPricesFetched && tokenBalancesIsFetched

  const lpTokenValueUsd = isFetched
    ? calculateLPTokenPrice(
        formatUnits(
          lPTokenBalances[token1Address].amountUnformatted,
          lPTokenBalances[token1Address].decimals
        ),
        formatUnits(
          lPTokenBalances[token2Address].amountUnformatted,
          lPTokenBalances[token2Address].decimals
        ),
        tokenPrices[token1Address]?.usd,
        tokenPrices[token2Address]?.usd,
        lPTokenBalances[lpTokenAddress].totalSupply
      )
    : null

  return { data: lpTokenValueUsd?.toNumber(), isFetched }
}

export const getLPPrizePoolMetadata = (prizePool: V3PrizePool) => {
  return LP_PRIZE_POOL_METADATA[prizePool.chainId]?.find(
    (lpPrizePool) => lpPrizePool.prizePool === prizePool.addresses.prizePool
  )
}
