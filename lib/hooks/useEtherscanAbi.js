import { useQuery } from 'react-query'

import { axiosInstance } from 'lib/axiosInstance'
import { useOnboard } from '@pooltogether/hooks'
import { ETHERSCAN_API_KEY, QUERY_KEYS } from 'lib/constants'
import { isValidAddress } from 'lib/utils/isValidAddress'

const ETHERSCAN_URI = `https://api.etherscan.io/api`

export const useEtherscanAbi = (contractAddress, disableQuery) => {
  const { network: chainId } = useOnboard()

  const isValid = isValidAddress(contractAddress)

  return useQuery(
    [QUERY_KEYS.etherscanContractAbi, chainId, contractAddress],
    async () => {
      return getEtherscanAbi(contractAddress)
    },
    {
      // TODO: This only works for mainnet, so check chainId
      enabled: chainId && isValid && contractAddress && !disableQuery,
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
