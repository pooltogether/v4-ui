import { useQuery } from 'react-query'

// TODO: REMOVE THIS FILE (THIS IS FOR TESTING PURPOSES BEFORE HOOKS PACKAGE UPDATE)

export const useCoingeckoExchangeRates = async () => {
  return useQuery(['getCoingeckoExchangeRates'], async () => await getCoingeckoExchangeRates(), {
    staleTime: Infinity,
    enabled: true,
    refetchInterval: false,
    refetchIntervalInBackground: false,
    refetchOnMount: false,
    refetchOnReconnect: false,
    refetchOnWindowFocus: false
  })
}

const getCoingeckoExchangeRates = async () => {
  try {
    const url = new URL(`https://api.coingecko.com/api/v3/exchange_rates`)
    const response = await fetch(url.toString())
    const exchangeRates = (await response.json()).rates

    return exchangeRates
  } catch (e) {
    console.error(e.message)
    return undefined
  }
}
