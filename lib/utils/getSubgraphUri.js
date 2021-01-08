import {
  POOLTOGETHER_GRAPH_URIS,
  POOLTOGETHER_LATEST_VERSION,
  POOLTOGETHER_VERSION_START_BLOCKS,
 } from 'lib/constants'

// Determines the correct subgraph to use depending on the block being queried
// and the environment the app is set to (ie. staging or production)
// (eg. if incoming block # is: 7400000, use 3_0_1)
// (eg. if incoming block # is: 7700000, use 3_1_0)

// v_3_0_1: 7399763
// v_3_1_0: 7687002
export function getSubgraphUri(chainId, incomingBlockNumber, env = process.env.NEXT_JS_ENV) {
  const v3_0_1StartingBlock = POOLTOGETHER_VERSION_START_BLOCKS['v3_0_1'][env][chainId]
  const v3_1_0StartingBlock = POOLTOGETHER_VERSION_START_BLOCKS['v3_1_0'][env][chainId]

  let version

  if (incomingBlockNumber === -1) {
    version = POOLTOGETHER_LATEST_VERSION[env]
  } else if (incomingBlockNumber >= v3_0_1StartingBlock && incomingBlockNumber < v3_1_0StartingBlock) {
    version = 'v3_0_1'
  } else if (incomingBlockNumber >= v3_1_0StartingBlock) {
    version = 'v3_1_0'
  } else {
    console.warn('getPoolSubgraphUri(), Could not find Subgraph URI for chainId, env and incomingBlockNumber:', chainId, env, incomingBlockNumber)
  }

  // console.log('using version', version, POOLTOGETHER_GRAPH_URIS[version][env][chainId])
  return POOLTOGETHER_GRAPH_URIS?.[version]?.[env]?.[chainId]
}
