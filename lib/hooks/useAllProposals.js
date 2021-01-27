import {
  CONTRACT_ADDRESSES,
  POOLTOGETHER_CURRENT_GOVERNANCE_GRAPH_URIS,
  PROPOSAL_STATES,
  QUERY_KEYS,
  SECONDS_PER_BLOCK
} from 'lib/constants'
import { batch, contract } from '@pooltogether/etherplex'
import { DateTime } from 'luxon'

import { AuthControllerContext } from 'lib/components/contextProviders/AuthControllerContextProvider'
import GovernorAlphaABI from 'abis/GovernorAlphaABI'
import gql from 'graphql-tag'
import { request } from 'graphql-request'
import { useContext } from 'react'
import { useQuery } from 'react-query'
import { useCurrentBlock } from 'lib/hooks/useCurrentBlock'

export function useAllProposals () {
  const { refetch, data, isFetching, isFetched, error } = useFetchProposals()

  if (error) {
    console.error(error)
  }

  return {
    loading: !isFetched || (isFetching && !isFetched),
    refetch,
    data,
    isFetching,
    isFetched,
    error
  }
}

function useFetchProposals () {
  const { chainId, pauseQueries } = useContext(AuthControllerContext)
  const { provider } = useContext(AuthControllerContext)
  const currentBlock = useCurrentBlock()

  return useQuery(
    [QUERY_KEYS.proposalsQuery, chainId, currentBlock?.blockNumber],
    async () => {
      return getProposals(provider, chainId, currentBlock)
    },
    {
      enabled: !pauseQueries && chainId && provider && currentBlock
    }
  )
}

async function getProposals (provider, chainId, currentBlock) {
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

    const currentBlockNumber = currentBlock.number
    const currentTimestamp = currentBlock.timestamp
    subgraphData.proposals.forEach((proposal) => {
      const { id, description } = proposal

      const endDateSeconds =
        currentTimestamp + SECONDS_PER_BLOCK * (Number(proposal.endBlock) - currentBlockNumber)
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
    console.error(JSON.stringify(error.message, undefined, 2))
    return {}
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
