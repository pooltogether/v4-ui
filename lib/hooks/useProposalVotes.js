import { useContext } from 'react'
import { useQuery } from 'react-query'
import gql from 'graphql-tag'
import { request } from 'graphql-request'

import { AuthControllerContext } from 'lib/components/contextProviders/AuthControllerContextProvider'
import {
  POOLTOGETHER_CURRENT_GOVERNANCE_GRAPH_URIS,
  QUERY_KEYS,
  VOTERS_PER_PAGE
} from 'lib/constants'

export function useProposalVotes(id, page) {
  const { refetch, data, isFetching, isFetched, error } = useFetchProposalVotes(id, page)

  if (error) {
    console.error(error)
  }

  return {
    refetch,
    data,
    isFetching,
    isFetched,
    error
  }
}

function useFetchProposalVotes(id, page) {
  const { chainId, pauseQueries } = useContext(AuthControllerContext)

  return useQuery(
    [QUERY_KEYS.proposalVotesQuery, chainId, page, id],
    async () => {
      return getProposalVotes(id, page, chainId)
    },
    {
      enabled: !pauseQueries && chainId
    }
  )
}

async function getProposalVotes(id, page, chainId) {
  const query = proposalVotesQuery()

  const actualPage = page >= 1 ? page - 1 : 0
  const first = VOTERS_PER_PAGE
  const skip = actualPage * VOTERS_PER_PAGE

  const variables = { id, first, skip }

  try {
    const subgraphData = await request(
      POOLTOGETHER_CURRENT_GOVERNANCE_GRAPH_URIS[chainId],
      query,
      variables
    )

    return subgraphData
  } catch (error) {
    console.error(JSON.stringify(error, undefined, 2))
    return {}
  }
}

const proposalVotesQuery = () => {
  return gql`
    query votesQuery($id: String!, $first: Int, $skip: Int) {
      votes(
        where: { proposal: $id }
        first: $first
        skip: $skip
        orderBy: "votesRaw"
        orderDirection: "desc"
      ) {
        support
        votesRaw
        voter {
          id
        }
      }
    }
  `
}
