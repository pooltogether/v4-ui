import { networkNameToChainId } from 'lib/utils/networkNameToChainId'

export const getChainId = (currentState) => {
  const networkName = process.env.NEXT_JS_DEFAULT_ETHEREUM_NETWORK_NAME
  let chainId = networkNameToChainId(networkName)

  if (currentState && currentState.appNetworkId) {
    // appNetworkId may not be what we want here ...
    chainId = currentState.appNetworkId
  }

  return chainId
}
