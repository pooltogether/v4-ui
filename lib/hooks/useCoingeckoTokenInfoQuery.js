import { useQuery } from 'react-query'

import { QUERY_KEYS } from 'lib/constants/queryKeys'
import { axiosInstance } from 'lib/services/axiosInstance'
import { useOnboard } from '@pooltogether/hooks'

const COINGECKO_TOKEN_INFO_BY_CONTRACT_ADDRESS_LAMBDA_PATH = `/.netlify/functions/coingeckoTokenInfoByContractAddress`

export function useCoingeckoTokenInfoQuery(address) {
  return useQuery([QUERY_KEYS.coingeckoTokenInfoQuery, address], async () => _getInfo(address), {
    enabled: Boolean(address),
    refetchInterval: false,
    refetchOnWindowFocus: false,
    retry: false
  })
}

const _getInfo = async (address) => {
  let data = {}

  try {
    const response = await axiosInstance.get(
      `${COINGECKO_TOKEN_INFO_BY_CONTRACT_ADDRESS_LAMBDA_PATH}?address=${address}`
    )
    data = { ...response.data }
  } catch (error) {
    // console.warn(error)
  }

  return data
}
