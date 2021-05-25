import { useQuery } from 'react-query'
import gql from 'graphql-tag'
import { request } from 'graphql-request'

import { useOnboard } from '@pooltogether/hooks'
import { POOLTOGETHER_CURRENT_GOVERNANCE_GRAPH_URIS, QUERY_KEYS } from 'lib/constants'
import { testAddress } from 'lib/utils/testAddress'

export function useDelegateData(address) {
  const addressError = testAddress(address)
  const { network: chainId } = useOnboard()

  return useQuery(
    [QUERY_KEYS.delegateDataQuery, chainId, address],
    async () => {
      return getDelegateData(address, chainId)
    },
    {
      enabled: chainId && address && !addressError
    }
  )
}

async function getDelegateData(address, chainId) {
  const query = delegateDataQuery()

  const variables = { id: address.toLowerCase() }

  try {
    const subgraphData = await request(
      POOLTOGETHER_CURRENT_GOVERNANCE_GRAPH_URIS[chainId],
      query,
      variables
    )
    return {
      ...subgraphData.delegate
    }
  } catch (error) {
    console.error(JSON.stringify(error, undefined, 2))
    return {}
  }
}

const delegateDataQuery = () => {
  return gql`
    query delegateQuery($id: String!) {
      delegate(id: $id) {
        id
        delegatedVotesRaw
        tokenHoldersRepresentedAmount
        votes {
          id
        }
        proposals(first: 5, orderBy: id, orderDirection: desc) {
          id
        }
      }
    }
  `
}
