const { axiosInstance } = require('lib/axiosInstance')
const { ETHERSCAN_API_KEY } = require('lib/constants')

const ETHERSCAN_URI = `https://api.etherscan.io/api`

export const getContractAbi = async (contractAddress) => {
  return axiosInstance.get(
    `${ETHERSCAN_URI}?module=contract&action=getabi&address=${contractAddress}&apikey=${ETHERSCAN_API_KEY}`
  )
}
