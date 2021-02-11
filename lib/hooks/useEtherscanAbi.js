import { useContext } from 'react'
import { useQuery } from 'react-query'

import { axiosInstance } from 'lib/axiosInstance'
import { AuthControllerContext } from 'lib/components/contextProviders/AuthControllerContextProvider'
import { ETHERSCAN_API_KEY, QUERY_KEYS } from 'lib/constants'
import { isValidAddress } from 'lib/utils/isValidAddress'

const ETHERSCAN_URI = `https://api.etherscan.io/api`

export const useEtherscanAbi = (contractAddress, disableQuery) => {
  const { chainId, pauseQueries } = useContext(AuthControllerContext)

  const isValid = isValidAddress(contractAddress)

  return useQuery(
    [QUERY_KEYS.etherscanContractAbi, chainId, contractAddress],
    async () => {
      return getEtherscanAbi(contractAddress)
    },
    {
      // TODO: This only works for mainnet, so check chainId
      enabled: !pauseQueries && chainId && isValid && contractAddress && !disableQuery,
      refetchInterval: false,
      refetchOnWindowFocus: false
    }
  )
}

const getEtherscanAbi = async (contractAddress) => {
  return axiosInstance.get(
    `${ETHERSCAN_URI}?module=contract&action=getabi&address=${contractAddress}&apikey=${ETHERSCAN_API_KEY}`
  )
}
