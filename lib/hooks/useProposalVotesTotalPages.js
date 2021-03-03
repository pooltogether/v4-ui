import request from 'graphql-request'
import gql from 'graphql-tag'
import { AuthControllerContext } from 'lib/components/contextProviders/AuthControllerContextProvider'
import {
  POOLTOGETHER_CURRENT_GOVERNANCE_GRAPH_URIS,
  QUERY_KEYS,
  VOTERS_PER_PAGE
} from 'lib/constants'
import { useContext } from 'react'
import { useQuery } from 'react-query'

export const useProposalVotesTotalPages = (proposalId) => {
  const { chainId, pauseQueries } = useContext(AuthControllerContext)

  return useQuery(
    [QUERY_KEYS.useProposalVotesTotalPages, chainId, proposalId],
    async () => {
      return getProposalVotesTotalPages(proposalId, chainId)
    },
    {
      enabled: !pauseQueries && chainId
    }
  )
}

const getProposalVotesTotalPages = async (proposalId, chainId) => {
  try {
    const query = allProposalVotesQuery()
    const variables = { id: proposalId }
    const subgraphData = await request(
      POOLTOGETHER_CURRENT_GOVERNANCE_GRAPH_URIS[chainId],
      query,
      variables
    )

    const voterCount = subgraphData.votes.length
    const totalPages = Math.ceil(Number(voterCount / VOTERS_PER_PAGE))

    return totalPages
  } catch (e) {
    console.warn(e.message)
    return 0
  }
}

const allProposalVotesQuery = () => {
  return gql`
    query allProposalVotesQuery($id: String!) {
      votes(where: { proposal: $id }) {
        id
      }
    }
  `
}
