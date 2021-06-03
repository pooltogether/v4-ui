import request from 'graphql-request'
import gql from 'graphql-tag'
import { useQuery } from 'react-query'

import {
  POOLTOGETHER_CURRENT_GOVERNANCE_GRAPH_URIS,
  QUERY_KEYS,
  VOTERS_PER_PAGE
} from 'lib/constants'
import { useGovernanceChainId } from 'lib/hooks/useGovernanceChainId'

export const useProposalVotesTotalPages = (proposalId) => {
  const chainId = useGovernanceChainId()

  return useQuery(
    [QUERY_KEYS.useProposalVotesTotalPages, chainId, proposalId],
    async () => {
      return getProposalVotesTotalPages(proposalId, chainId)
    },
    {
      enabled: Boolean(chainId)
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
