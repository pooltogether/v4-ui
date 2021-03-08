import { useContext } from 'react'
import gql from 'graphql-tag'
import { request } from 'graphql-request'
import { useQuery } from 'react-query'
import { DateTime } from 'luxon'
import { isEmpty } from 'lodash'
import { batch, contract } from '@pooltogether/etherplex'

import {
  CONTRACT_ADDRESSES,
  POOLTOGETHER_CURRENT_GOVERNANCE_GRAPH_URIS,
  PROPOSAL_STATES,
  QUERY_KEYS,
  SECONDS_PER_BLOCK
} from 'lib/constants'

import GovernorAlphaABI from 'abis/GovernorAlphaABI'
import { AuthControllerContext } from 'lib/components/contextProviders/AuthControllerContextProvider'
import { useReadProvider } from 'lib/hooks/useReadProvider'
import { useBlockOnProviderLoad } from 'lib/hooks/useBlockOnProviderLoad'

export function useAllProposals() {
  const { refetch, data, isFetching, isFetched, error } = useFetchProposals()

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

function useFetchProposals() {
  const { chainId, pauseQueries } = useContext(AuthControllerContext)
  const { readProvider, isLoaded: readProviderIsLoaded } = useReadProvider()
  const block = useBlockOnProviderLoad()

  return useQuery(
    [QUERY_KEYS.proposalsQuery, chainId, block?.blockNumber],
    async () => {
      return getProposals(readProvider, chainId, block)
    },
    {
      enabled: !pauseQueries && chainId && readProviderIsLoaded && !isEmpty(block)
    }
  )
}

async function getProposals(provider, chainId, block) {
  const query = proposalsQuery()
  const governanceAddress = CONTRACT_ADDRESSES[chainId].GovernorAlpha

  try {
    const proposals = {}

    const subgraphData = await request(POOLTOGETHER_CURRENT_GOVERNANCE_GRAPH_URIS[chainId], query)

    const batchCalls = []
    subgraphData.proposals.forEach((proposal) => {
      const governanceContract = contract(proposal.id, GovernorAlphaABI, governanceAddress)
      batchCalls.push(governanceContract.proposals(proposal.id))
      batchCalls.push(governanceContract.state(proposal.id))
    })

    const proposalChainData = await batch(provider, ...batchCalls)

    const blockNumber = block.number
    const currentTimestamp = block.timestamp
    subgraphData.proposals.forEach((proposal) => {
      const { id, description } = proposal

      const endDateSeconds =
        currentTimestamp + SECONDS_PER_BLOCK * (Number(proposal.endBlock) - blockNumber)
      const endDate = DateTime.fromSeconds(endDateSeconds)

      proposals[id] = {
        ...proposal,
        title: description?.split(/# |\n/g)[1] || 'Untitled',
        description: description || 'No description.',
        againstVotes: proposalChainData[id].proposals.againstVotes,
        forVotes: proposalChainData[id].proposals.forVotes,
        totalVotes: proposalChainData[id].proposals.forVotes.add(
          proposalChainData[id].proposals.againstVotes
        ),
        status: PROPOSAL_STATES[proposalChainData[id].state[0]],
        endDateSeconds,
        endDate
      }
    })

    return proposals
  } catch (error) {
    // console.error(JSON.stringify(error.message, undefined, 2))
    // throw new Error(error)
    return {
      proposals: {},
      error
    }
  }
}

const proposalsQuery = () => {
  return gql`
    query proposalsQuery {
      proposals {
        id
        proposer {
          id
          delegatedVotesRaw
          delegatedVotes
          tokenHoldersRepresentedAmount
        }
        targets
        values
        signatures
        calldatas
        startBlock
        endBlock
        description
        status
        executionETA
      }
    }
  `
}
