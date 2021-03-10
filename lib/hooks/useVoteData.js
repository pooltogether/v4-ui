import { request } from 'graphql-request'
import gql from 'graphql-tag'
import { AuthControllerContext } from 'lib/components/contextProviders/AuthControllerContextProvider'
import { POOLTOGETHER_CURRENT_GOVERNANCE_GRAPH_URIS, QUERY_KEYS } from 'lib/constants'
import { testAddress } from 'lib/utils/testAddress'
import { useContext } from 'react'
import { useQuery } from 'react-query'

export const useVoteData = (delegateAddress, proposalId) => {
  const { chainId, pauseQueries } = useContext(AuthControllerContext)
  const addressError = testAddress(delegateAddress)

  const results = useQuery(
    [QUERY_KEYS.voteDataQuery, chainId, delegateAddress, proposalId],
    async () => {
      return getVoteData(delegateAddress, proposalId, chainId)
    },
    {
      enabled: !pauseQueries && chainId && delegateAddress && !addressError && proposalId,
      refetchInterval: false
    }
  )

  const { isFetched, isFetching, error } = results

  if (error) {
    console.error(error)
  }

  return {
    ...results
  }
}

async function getVoteData(delegateAddress, proposalId, chainId) {
  const query = voteDataQuery()

  const variables = { id: `${delegateAddress}-${proposalId}` }

  try {
    const subgraphData = await request(
      POOLTOGETHER_CURRENT_GOVERNANCE_GRAPH_URIS[chainId],
      query,
      variables
    )

    return {
      ...subgraphData.vote,
      delegateDidVote: subgraphData.vote?.support !== undefined
    }
  } catch (error) {
    console.error(JSON.stringify(error, undefined, 2))
    return {}
  }
}

const voteDataQuery = () => {
  return gql`
    query voteDataQuery($id: String!) {
      vote(id: $id) {
        support
      }
    }
  `
}
