import {
  POOLTOGETHER_GRAPH_URIS,
  POOLTOGETHER_CONTRACT_VERSIONS,
 } from 'lib/constants'

export function getSubgraphUriByContractAddress(chainId, contractAddress, env = process.env.NEXT_JS_ENV) {
  const contractVersion = POOLTOGETHER_CONTRACT_VERSIONS[contractAddress]

  let uri
  try {
    uri = POOLTOGETHER_GRAPH_URIS?.[contractVersion]?.[env]?.[chainId]
  } catch (e) {
    console.error('could not find subgraph URI for contract on end and network:', contractAddress, env, chainId)
  }
  
  return uri
}
