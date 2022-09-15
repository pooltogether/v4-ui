import { LP_PRIZE_POOL_METADATA } from '@constants/v3'
import { formatUnits } from '@ethersproject/units'
import { useCoingeckoTokenPrices, useTokenBalances } from '@pooltogether/hooks'
import { calculateLPTokenPrice } from '@pooltogether/utilities'
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
  const token1BalanceData = tokenBalancesIsFetched && lPTokenBalances[token1Address]
  const token1ValueUsd = tokenPrices && tokenPrices?.[token1Address]?.usd
  const token2BalanceData = tokenBalancesIsFetched && lPTokenBalances[token2Address]
  const token2ValueUsd = tokenPrices && tokenPrices?.[token2Address]?.usd

  const lpTokenValueUsd =
    isFetched && !!token1BalanceData && !!token2BalanceData && !!token1ValueUsd && !!token2ValueUsd
      ? calculateLPTokenPrice(
          formatUnits(token1BalanceData.amountUnformatted, token1BalanceData.decimals),
          formatUnits(token2BalanceData.amountUnformatted, token2BalanceData.decimals),
          token1ValueUsd,
          token2ValueUsd,
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
