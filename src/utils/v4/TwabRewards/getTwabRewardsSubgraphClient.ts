import { TWAB_REWARDS_SUBGRAPH_URIS } from '@constants/config'
import { theGraphCustomFetch } from '@utils/theGraphCustomFetch'
import { GraphQLClient } from 'graphql-request'

export const getTwabRewardsSubgraphUri = (chainId) => {
  return TWAB_REWARDS_SUBGRAPH_URIS[chainId]
}

export const getTwabRewardsSubgraphClient = (chainId) => {
  const uri = getTwabRewardsSubgraphUri(chainId)

  return new GraphQLClient(uri, {
    fetch: theGraphCustomFetch
  })
}
