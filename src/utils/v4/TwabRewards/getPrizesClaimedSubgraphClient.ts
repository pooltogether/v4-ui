import { GraphQLClient } from 'graphql-request'

import { CHAIN_ID } from '@constants/misc'
import { theGraphCustomFetch } from '@utils/theGraphCustomFetch'

const PRIZES_CLAIMED_SUBGRAPH_URIS = {
  [CHAIN_ID.optimism]: `https://api.thegraph.com/subgraphs/name/pooltogether/optimism-v4-prizes-claimed`,
  [CHAIN_ID.mainnet]: `https://api.thegraph.com/subgraphs/name/pooltogether/mainnet-v4-prizes-claimed`,
  [CHAIN_ID.polygon]: `https://api.thegraph.com/subgraphs/name/pooltogether/polygon-v4-prizes-claimed`,
  [CHAIN_ID.avalanche]: `https://api.thegraph.com/subgraphs/name/pooltogether/avalanche-v4-prizes-claimed`,
  [CHAIN_ID.rinkeby]: `https://api.thegraph.com/subgraphs/name/pooltogether/rinkeby-v4-prizes-claimed`,
  [CHAIN_ID.mumbai]: `https://api.thegraph.com/subgraphs/name/pooltogether/mumbai-v4-prizes-claimed`,
  [CHAIN_ID.fuji]: `https://api.thegraph.com/subgraphs/name/pooltogether/fuji-v4-prizes-claimed`,
  [CHAIN_ID[
    'optimism-kovan'
  ]]: `https://api.thegraph.com/subgraphs/name/pooltogether/optimism-kovan-v4-prizes-claimed`
}

export const getPrizesClaimedSubgraphUri = (chainId) => {
  return PRIZES_CLAIMED_SUBGRAPH_URIS[chainId]
}

export const getPrizesClaimedSubgraphClient = (chainId) => {
  const uri = getPrizesClaimedSubgraphUri(chainId)

  return new GraphQLClient(uri, {
    fetch: theGraphCustomFetch
  })
}
