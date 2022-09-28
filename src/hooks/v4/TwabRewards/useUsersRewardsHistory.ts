import { ClaimedPromotion } from '@interfaces/promotions'
import { getRefetchInterval } from '@pooltogether/hooks'
import { useUsersAddress } from '@pooltogether/wallet-connection'
import { getTwabRewardsSubgraphClient } from '@utils/v4/TwabRewards/getTwabRewardsSubgraphClient'
import { GraphQLClient } from 'graphql-request'
import gql from 'graphql-tag'
import { useQuery } from 'react-query'

/**
 * Fetch an account's
 */
export const useUsersRewardsHistory = (chainId: number) => {
  const usersAddress = useUsersAddress()
  const client = getTwabRewardsSubgraphClient(chainId)

  return useQuery(
    getUsersRewardsHistoryKey(chainId, usersAddress),
    async () => getUsersRewardsHistory(chainId, client, usersAddress),
    {
      refetchInterval: getRefetchInterval(chainId),
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

  const rewardsHistoryResponse: {
    account: {
      claimedPromotions: ClaimedPromotion[]
      id: string
    }
  } = await client.request(query, variables).catch((e) => {
    console.error(e.message)
    throw e
  })

  const { account } = rewardsHistoryResponse || {}
  const { claimedPromotions } = account || {}

  for (let i = 0; i < claimedPromotions?.length; i++) {
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
