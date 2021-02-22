import { useContext, useEffect, useState } from 'react'
import { useQuery } from 'react-query'
import gql from 'graphql-tag'
import { request } from 'graphql-request'
import { batch, contract } from '@pooltogether/etherplex'

import { AuthControllerContext } from 'lib/components/contextProviders/AuthControllerContextProvider'
import {
  CONTRACT_ADDRESSES,
  POOLTOGETHER_CURRENT_GOVERNANCE_GRAPH_URIS,
  PROPOSAL_STATES,
  QUERY_KEYS,
  VOTERS_PER_PAGE
} from 'lib/constants'
import GovernorAlphaABI from 'abis/GovernorAlphaABI'
import { atom, useAtom } from 'jotai'

export const proposalVotesPageNumbersAtom = atom({})

export function useProposalVotes (id, page) {
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

function useFetchProposalVotes (id, page) {
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

async function getProposalVotes (id, page, chainId) {
  const query = page === -1 ? allProposalVotesQuery() : proposalVotesQuery()

  const actualPage = page > 0 ? page - 1 : 0
  const first = actualPage === -1 ? 1000 : VOTERS_PER_PAGE
  const skip = actualPage === -1 ? 0 : actualPage * VOTERS_PER_PAGE

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

const allProposalVotesQuery = () => {
  return gql`
    query allProposalVotesQuery($id: String!, $first: Int, $skip: Int) {
      votes(where: { proposal: $id }, first: $first, skip: $skip) {
        id
      }
    }
  `
}
