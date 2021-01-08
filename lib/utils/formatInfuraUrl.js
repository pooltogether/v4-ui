import { chainIdToNetworkName } from 'lib/utils/chainIdToNetworkName'

export function formatInfuraUrl(appId, chainId) {
  let network = chainIdToNetworkName(chainId)
  return `https://${network}.infura.io/v3/${appId}`
}