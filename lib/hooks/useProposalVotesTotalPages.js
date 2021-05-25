import request from 'graphql-request'
import gql from 'graphql-tag'
import { useOnboard } from '@pooltogether/hooks'
import {
  POOLTOGETHER_CURRENT_GOVERNANCE_GRAPH_URIS,
  QUERY_KEYS,
  VOTERS_PER_PAGE
} from 'lib/constants'
import { useQuery } from 'react-query'

export const useProposalVotesTotalPages = (proposalId) => {
  const { network: chainId } = useOnboard()

  return useQuery(
    [QUERY_KEYS.useProposalVotesTotalPages, chainId, proposalId],
    async () => {
      return getProposalVotesTotalPages(proposalId, chainId)
    },
    {
      enabled: chainId
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
