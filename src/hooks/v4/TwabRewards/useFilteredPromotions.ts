import gql from 'graphql-tag'
import { useQuery } from 'react-query'

import { CHAIN_ID } from '@constants/misc'
import { useTwabRewardsSubgraphClient } from '@twabRewards/hooks/useTwabRewardsSubgraphClient'

const FILTERS = {
  [CHAIN_ID.rinkeby]: [],
  [CHAIN_ID.mumbai]: [],
  [CHAIN_ID.fuji]: [],
  [CHAIN_ID.avalanche]: [],
  [CHAIN_ID.mainnet]: [],
  [CHAIN_ID.polygon]: ['0x1', '0x5']
}

/**
 *
 * @param chainId
 * @returns Promotion[]
 */
export const useFilteredPromotions = (chainId: number) => {
  return useQuery(['useFilteredPromotions', chainId], async () => getFilteredPromotions(chainId))
}

export const getFilteredPromotions = async (chainId, account) => {
  const query = promotionsQuery()
  const variables = {
    accountAddress: account.toLowerCase()
  }

  const client = useTwabRewardsSubgraphClient(chainId)

  return client.request(query, variables).catch((e) => {
    console.error(e.message)
    return null
  })
}

const promotionsQuery = () => {
  return gql`
    query promotionsQuery($accountAddress: String!) {
      promotions(where: { creator: $accountAddress }) {
        id
        creator
        createdAt
        startTimestamp
        numberOfEpochs
        epochDuration
        tokensPerEpoch
        rewardsUnclaimed
        token
        ticket
      }
    }
  `
}
