import request, { gql } from 'graphql-request'
import { QUERY_KEYS } from 'lib/constants'
import { getPoolPoolSnapshotId } from 'lib/utils/getPoolPoolSnapshotId'
import { useQuery } from 'react-query'

const SNAPSHOT_GRAPHQL_URL = 'https://hub.snapshot.page/graphql'

export const usePoolPoolProposal = (chainId, proposalId) => {
  const poolPoolSnapShotId = getPoolPoolSnapshotId(chainId, proposalId)
  const enabled = Boolean(poolPoolSnapShotId)
  return useQuery(
    [QUERY_KEYS.poolPoolProposal, chainId, proposalId],
    () => getPoolPoolProposal(poolPoolSnapShotId),
    { enabled, refetchInterval: false, refetchOnReconnect: false, refetchOnWindowFocus: false }
  )
}

const getPoolPoolProposal = async (snapshotProposalId) => {
  const query = proposalsQuery()
  const variables = { id: snapshotProposalId }
  return await request(SNAPSHOT_GRAPHQL_URL, query, variables)
}

const proposalsQuery = () => {
  return gql`
    query Proposal($id: String!) {
      proposal(id: $id) {
        id
        title
        body
        choices
        start
        end
        snapshot
        state
        author
        space {
          id
          name
        }
      }
    }
  `
}
