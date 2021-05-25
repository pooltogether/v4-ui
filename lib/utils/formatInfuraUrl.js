import { getNetworkNameAliasByChainId } from '@pooltogether/utilities'

export function formatInfuraUrl(appId, chainId) {
  let network = getNetworkNameAliasByChainId(chainId)
  return `https://${network}.infura.io/v3/${appId}`
}
