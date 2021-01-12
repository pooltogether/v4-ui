import { useContext } from 'react'
import { useQuery } from 'react-query'
import gql from 'graphql-tag'
import { request } from 'graphql-request'

import { AuthControllerContext } from 'lib/components/contextProviders/AuthControllerContextProvider'
import {
  MAINNET_POLLING_INTERVAL,
  POOLTOGETHER_CURRENT_GOVERNANCE_GRAPH_URIS,
  QUERY_KEYS
} from 'lib/constants'

import { atom, useAtom } from 'jotai'
import { useEffect } from 'react'

export const governanceDataQueryAtom = atom({})

export function useGovernanceData () {
  const { refetch, data, isFetching, isFetched, error } = useGovernanceDataQuery()

  const [governanceData, setGovernanceData] = useAtom(governanceDataQueryAtom)

  if (error) {
    console.error(error)
  }

  useEffect(() => {
    setGovernanceData({
      refetch,
      data,
      isFetching,
      isFetched,
      error
    })
  }, [isFetching, isFetched])

  return {
    loading: !isFetched || (isFetching && !isFetched),
    refetch,
    data,
    isFetching,
    isFetched,
    error
  }
}

function useGovernanceDataQuery () {
  const { chainId, pauseQueries } = useContext(AuthControllerContext)

  const refetchInterval = MAINNET_POLLING_INTERVAL

  return useQuery(
    [QUERY_KEYS.governanceDataQuery, chainId],
    async () => {
      return getGovernanceData(chainId)
    },
    {
      enabled: !pauseQueries && chainId,
      refetchInterval
    }
  )
}

async function getGovernanceData (chainId) {
  const query = governanceDataQuery()

  const variables = {
    id: 'GOVERNANCE'
  }

  try {
    const data = await request(
      POOLTOGETHER_CURRENT_GOVERNANCE_GRAPH_URIS[chainId],
      query,
      variables
    )

    return data
  } catch (error) {
    console.error(JSON.stringify(error, undefined, 2))
    return {}
  }
}

const governanceDataQuery = () => {
  return gql`
    query governanceDataQuery($id: String!) {
      governance(id: $id) {
        id
        proposals
        currentTokenHolders
        currentDelegates
        totalTokenHolders
        totalDelegates

        delegatedVotesRaw
        delegatedVotes
        proposalsQueued
      }
    }
  `
}
