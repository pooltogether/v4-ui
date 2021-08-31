import { TokenBalanceWithUsd, useCoingeckoTokenPrices } from '@pooltogether/hooks'
import { usePoolChainId } from 'lib/hooks/usePoolChainId'
import { usePrizePool } from 'lib/hooks/usePrizePool'
import { usePrizePoolTokens } from 'lib/hooks/usePrizePoolTokens'
import { useMemo } from 'react'

interface PrizePoolTokensWithUsd {
  ticket: TokenBalanceWithUsd
  underlyingToken: TokenBalanceWithUsd
}

export const usePrizePoolTokensWithUsd = () => {
  const chainId = usePoolChainId()
  const prizePool = usePrizePool()
  const tokenAddresses = Object.values(prizePool.tokens).map((token) => token.address)
  const { data: prizePoolTokens, isFetched: isPrizePoolTokensFetched } = usePrizePoolTokens()
  const { data: tokenPrices, isFetched: isTokenPricesFetched } = useCoingeckoTokenPrices(
    chainId,
    tokenAddresses
  )

  return useMemo<{ isFetched: boolean; data: PrizePoolTokensWithUsd }>(() => {
    const isFetched = isTokenPricesFetched && isPrizePoolTokensFetched

    if (!isFetched) {
      return {
        isFetched: false,
        data: undefined
      }
    }

    const data: PrizePoolTokensWithUsd = {
      ticket: {
        ...prizePoolTokens[prizePool.tokens.ticket.address],
        ...tokenPrices[prizePool.tokens.underlyingToken.address]
      },
      underlyingToken: {
        ...prizePoolTokens[prizePool.tokens.underlyingToken.address],
        ...tokenPrices[prizePool.tokens.underlyingToken.address]
      }
    }

    return {
      isFetched: true,
      data
    }
  }, [isPrizePoolTokensFetched, isTokenPricesFetched, prizePoolTokens, tokenPrices])
}
