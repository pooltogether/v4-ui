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

export const useProposalVotesPages = (id) => {
  const [pageNumbers, setPageNumbers] = useAtom(proposalVotesPageNumbersAtom)
  const setPageNumber = (pageNumber) => {
    console.log(pageNumber)
    setPageNumbers({
      ...pageNumbers,
      [id]: pageNumber
    })
  }

  return [pageNumbers[id] || 1, setPageNumber]
}

export function useProposalVotes (id) {
  const [pageNumber] = useProposalVotesPages(id)
  const { refetch, data, isFetching, isFetched, error } = useFetchProposalVotes(id, pageNumber)
  console.log({ refetch, data, isFetching, isFetched, error })

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

function useFetchProposalVotes (id, pageNumber) {
  const { chainId, pauseQueries } = useContext(AuthControllerContext)

  return useQuery(
    [QUERY_KEYS.proposalVotesQuery, chainId, pageNumber, id],
    async () => {
      return getProposalVotes(id, pageNumber, chainId)
    },
    {
      enabled: !pauseQueries && chainId
    }
  )
}

async function getProposalVotes (id, pageNumber, chainId) {
  const query = proposalVotesQuery()

  const variables = { id, first: VOTERS_PER_PAGE, skip: (pageNumber - 1) * VOTERS_PER_PAGE }

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
