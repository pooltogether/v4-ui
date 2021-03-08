import { useContext, useEffect, useState } from 'react'
import { useQuery } from 'react-query'
import gql from 'graphql-tag'
import { request } from 'graphql-request'
import { batch, contract } from '@pooltogether/etherplex'

import { AuthControllerContext } from 'lib/components/contextProviders/AuthControllerContextProvider'
import {
  CONTRACT_ADDRESSES,
  DELEGATES_PER_PAGE,
  POOLTOGETHER_CURRENT_GOVERNANCE_GRAPH_URIS,
  PROPOSAL_STATES,
  QUERY_KEYS,
  VOTERS_PER_PAGE
} from 'lib/constants'
import GovernorAlphaABI from 'abis/GovernorAlphaABI'

export function useAllDelegates(pageNumber) {
  const { refetch, data, isFetching, isFetched, error } = useFetchDelegates(pageNumber)

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

function useFetchDelegates(pageNumber) {
  const { chainId, pauseQueries } = useContext(AuthControllerContext)

  return useQuery(
    [QUERY_KEYS.delegatesQuery, chainId, pageNumber],
    async () => {
      return getDelegates(pageNumber, chainId)
    },
    {
      enabled: !pauseQueries && chainId
    }
  )
}

async function getDelegates(pageNumber, chainId) {
  const query = delegatesQuery()

  const variables = { first: DELEGATES_PER_PAGE, skip: pageNumber * VOTERS_PER_PAGE }

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

const delegatesQuery = () => {
  return gql`
    query delegatesQuery($first: Int, $skip: Int) {
      delegates(first: $first, skip: $skip, orderBy: "delegatedVotesRaw", orderDirection: "desc") {
        id
        delegatedVotesRaw
        proposals {
          id
        }
      }
    }
  `
}
