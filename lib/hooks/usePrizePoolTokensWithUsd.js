import { useCoingeckoTokenPrices } from '@pooltogether/hooks'
import { usePoolChainId } from 'lib/hooks/usePoolChainId'
import { usePrizePool } from 'lib/hooks/usePrizePool'
import { usePrizePoolTokens } from 'lib/hooks/usePrizePoolTokens'
import { useMemo } from 'react'

export const usePrizePoolTokensWithUsd = () => {
  const chainId = usePoolChainId()
  const prizePool = usePrizePool()
  const tokenAddresses = Object.values(prizePool.tokens).map((token) => token.address)
  const { data: prizePoolTokens, isFetched: isPrizePoolTokensFetched } = usePrizePoolTokens()
  const { data: tokenPrices, isFetched: isTokenPricesFetched } = useCoingeckoTokenPrices(
    chainId,
    tokenAddresses
  )

  return useMemo(() => {
    const isFetched = isTokenPricesFetched && isPrizePoolTokensFetched
    const data = {}

    console.log(isPrizePoolTokensFetched, isTokenPricesFetched, prizePoolTokens, tokenPrices)

    if (!isFetched) {
      return {
        isFetched,
        data
      }
    }

    data[prizePool.tokens.ticket.address] = {
      ...prizePoolTokens[prizePool.tokens.ticket.address],
      ...tokenPrices[prizePool.tokens.underlyingToken.address]
    }
    data[prizePool.tokens.underlyingToken.address] = {
      ...prizePoolTokens[prizePool.tokens.underlyingToken.address],
      ...tokenPrices[prizePool.tokens.underlyingToken.address]
    }

    return {
      isFetched,
      data
    }
  }, [isPrizePoolTokensFetched, isTokenPricesFetched, prizePoolTokens, tokenPrices])
}
