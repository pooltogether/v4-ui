import { useCoingeckoTokenPrices, useCoingeckoTokenPricesAcrossChains } from '@pooltogether/hooks'
import { useMemo } from 'react'
import { useQuery } from 'react-query'
import { useAllPrizePoolTicketTwabTotalSupplies } from '../PrizePool/useAllPrizePoolTicketTwabTotalSupplies'
import { useAllPrizePoolTokens } from '../PrizePool/useAllPrizePoolTokens'

export const usePrizePoolNetworkTvl = () => {
  const queryResults = useAllPrizePoolTokens()
  const isFetched = queryResults.every((queryResult) => queryResult.isFetched)
  const isFetching = queryResults.every((queryResult) => queryResult.isFetching)

  const tokens = useMemo(() => {
    if (!isFetched) return null
    return queryResults.reduce<{ [key: string]: string[] }>((tokens, queryResult) => {
      if (!!tokens[queryResult.data.chainId]) {
        tokens[queryResult.data.chainId].push(queryResult.data.token.address)
      } else {
        tokens[queryResult.data.chainId] = [queryResult.data.token.address]
      }
      return tokens
    }, {})
  }, [isFetched, isFetching])

  const { data: tokenPrices, isFetched: isPricesFetched } =
    useCoingeckoTokenPricesAcrossChains(tokens)

  return useMemo(() => {}, [])
}
