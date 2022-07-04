import gql from 'graphql-tag'
import { GraphQLClient } from 'graphql-request'
import { useQuery } from 'react-query'
import { useUsersAddress } from '@pooltogether/wallet-connection'

import { NO_REFETCH } from '@constants/query'
import { useTwabRewardsSubgraphClient } from '@hooks/v4/TwabRewards/useTwabRewardsSubgraphClient'
import { getAmountFromBigNumber } from '@utils/getAmountFromBigNumber'

/**
 * Fetch an account's
 */
export const useUsersRewardsHistory = (chainId: number) => {
  const usersAddress = useUsersAddress()
  const client = useTwabRewardsSubgraphClient(chainId)

  return useQuery(
    getUsersRewardsHistoryKey(chainId, usersAddress),
    async () => getUsersRewardsHistory(chainId, client, usersAddress),
    {
      ...NO_REFETCH,

      enabled: Boolean(chainId) && Boolean(usersAddress)
    }
  )
}

const getUsersRewardsHistoryKey = (chainId: number, usersAddress: string) => [
  'getUsersRewardsHistory',
  chainId,
  usersAddress
]

export const getUsersRewardsHistory = async (
  chainId: number,
  client: GraphQLClient,
  usersAddress: string
) => {
  const query = usersRewardsHistoryQuery()
  const variables = { id: usersAddress.toLowerCase() }

  const rewardsHistoryResponse = await client.request(query, variables).catch((e) => {
    console.error(e.message)
    throw e
  })

  const { account } = rewardsHistoryResponse || {}
  const { claimedPromotions } = account

  for (let i = 0; i < claimedPromotions.length; i++) {
    const claimedPromotion = claimedPromotions[i]

    claimedPromotions[i] = formatClaimedPromotionData(claimedPromotion)
  }

  return { claimedPromotions }
}

const formatClaimedPromotionData = (claimedPromotion) => {
  return {
    ...claimedPromotion,
    promotionId: claimedPromotion.id.split('-')[1]
  }
}

const usersRewardsHistoryQuery = () => {
  return gql`
    query usersRewardsHistoryQuery($id: String!) {
      account(id: $id) {
        id
        claimedPromotions {
          id
          epochs
          rewards
        }
      }
    }
  `
}
