import { useContext } from 'react'
import { useQuery } from 'react-query'
import { ethers } from 'ethers'
import gql from 'graphql-tag'
import { request } from 'graphql-request'

import { POOLTOGETHER_CURRENT_GOVERNANCE_GRAPH_URIS, QUERY_KEYS } from 'lib/constants'
import { AuthControllerContext } from 'lib/components/contextProviders/AuthControllerContextProvider'
import { testAddress } from 'lib/utils/testAddress'
import { useBlockOnProviderLoad } from 'lib/hooks/useBlockOnProviderLoad'

export function useTokenHolder (address, blockNumber) {
  const block = useBlockOnProviderLoad()

  // Only add filter if it is in the past
  const isDataFromBeforeCurrentBlock = block && blockNumber && blockNumber < block.blockNumber

  const blockNumberToQuery = isDataFromBeforeCurrentBlock ? blockNumber : undefined
  const { refetch, data, isFetching, isFetched, error } = useFetchTokenHolder(
    address,
    blockNumberToQuery
  )

  if (error) {
    console.error(error)
  }

  return {
    isDataFromBeforeCurrentBlock,
    refetch,
    data,
    isFetching,
    isFetched,
    error
  }
}

function useFetchTokenHolder (address, blockNumber) {
  const { chainId, pauseQueries } = useContext(AuthControllerContext)

  const addressError = testAddress(address)

  return useQuery(
    [QUERY_KEYS.tokenHolderQuery, chainId, address, blockNumber],
    async () => {
      return getTokenHolder(address, chainId, blockNumber)
    },
    {
      enabled: !pauseQueries && chainId && address && !addressError
    }
  )
}

async function getTokenHolder (address, chainId, blockNumber) {
  try {
    const query = tokenHolderQuery(blockNumber)
    const variables = { id: address.toLowerCase() }
    const subgraphData = await request(
      POOLTOGETHER_CURRENT_GOVERNANCE_GRAPH_URIS[chainId],
      query,
      variables
    )

    if (!subgraphData.tokenHolder && !subgraphData.delegate) {
      return {
        tokenBalance: '0',
        hasDelegated: false,
        selfDelegated: false,
        hasBalance: false,
        canVote: false,
        delegateAddress: '',
        votes: '0',
        tokenHoldersRepresentedAmount: 0
      }
    }

    const hasDelegated =
      Boolean(subgraphData?.tokenHolder?.delegate?.id) &&
      subgraphData?.tokenHolder?.delegate?.id !== ethers.constants.AddressZero
    const selfDelegated =
      address.toLowerCase() === subgraphData?.tokenHolder?.delegate?.id?.toLowerCase()
    const hasBalance = Number(subgraphData?.tokenHolder?.tokenBalance) > 0
    const canVote =
      selfDelegated ||
      (!hasDelegated &&
        Boolean(subgraphData?.delegate?.delegatedVotes) &&
        subgraphData.delegate.delegatedVotes !== '0')
    const delegateAddress = hasDelegated
      ? subgraphData.tokenHolder.delegate.id
      : canVote
      ? address
      : null
    const votes = hasDelegated
      ? subgraphData.tokenHolder.delegate.delegatedVotes
      : canVote
      ? subgraphData.delegate.delegatedVotes
      : '0'
    const tokenBalance = subgraphData?.tokenHolder?.tokenBalance || '0'
    const tokenHoldersRepresentedAmount = hasDelegated
      ? subgraphData.tokenHolder.delegate.tokenHoldersRepresentedAmount
      : canVote
      ? subgraphData.delegate.tokenHoldersRepresentedAmounts
      : 0
    return {
      ...subgraphData.tokenHolder,
      tokenBalance,
      hasDelegated,
      selfDelegated,
      hasBalance,
      canVote,
      delegateAddress,
      votes,
      tokenHoldersRepresentedAmount
    }
  } catch (error) {
    console.error(JSON.stringify(error, undefined, 2))
    return {
      tokenBalance: '0',
      hasDelegated: false,
      selfDelegated: false,
      hasBalance: false,
      canVote: false,
      delegateAddress: '',
      votes: '0',
      tokenHoldersRepresentedAmount: 0
    }
  }
}

const tokenHolderQuery = (blockNumber) => {
  const blockFilter = blockNumber ? `, block: { number: ${blockNumber} }` : ''

  return gql`
    query tokenHolderQuery($id: String!) {
      tokenHolder(id: $id ${blockFilter}) {
        delegate {
          id
          delegatedVotes
          tokenHoldersRepresentedAmount
        }
        tokenBalance
      }
      delegate(id: $id ${blockFilter}) {
        delegatedVotes
        tokenHoldersRepresentedAmount
      }
    }
  `
}
