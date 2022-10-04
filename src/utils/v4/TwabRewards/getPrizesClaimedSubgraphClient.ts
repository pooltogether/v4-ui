import { PRIZES_CLAIMED_SUBGRAPH_URIS } from '@constants/config'
import { theGraphCustomFetch } from '@utils/theGraphCustomFetch'
import { GraphQLClient } from 'graphql-request'

export const getPrizesClaimedSubgraphUri = (chainId) => {
  return PRIZES_CLAIMED_SUBGRAPH_URIS[chainId]
}

export const getPrizesClaimedSubgraphClient = (chainId) => {
  const uri = getPrizesClaimedSubgraphUri(chainId)

  return new GraphQLClient(uri, {
    fetch: theGraphCustomFetch
  })
}
