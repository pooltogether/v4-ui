import { POOLTOGETHER_CURRENT_GOVERNANCE_GRAPH_URIS, QUERY_KEYS } from 'lib/constants'

import { AuthControllerContext } from 'lib/components/contextProviders/AuthControllerContextProvider'
import { ethers } from 'ethers'
import gql from 'graphql-tag'
import { request } from 'graphql-request'
import { testAddress } from 'lib/utils/testAddress'
import { useContext } from 'react'
import { useQuery } from 'react-query'
import { useBlockOnProviderLoad } from 'lib/hooks/useBlockOnProviderLoad'
import { useReadProvider } from 'lib/hooks/useReadProvider'

export function useTokenHolder (address, blockNumber) {
  const { readProvider } = useReadProvider()
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
  const query = tokenHolderQuery(blockNumber)

  const variables = { id: address.toLowerCase() }

  try {
    const subgraphData = await request(
      POOLTOGETHER_CURRENT_GOVERNANCE_GRAPH_URIS[chainId],
      query,
      variables
    )

    if (!subgraphData.tokenHolder) {
      return null
    }

    return {
      ...subgraphData.tokenHolder,
      hasDelegated:
        Boolean(subgraphData?.tokenHolder?.delegate?.id) &&
        subgraphData?.tokenHolder?.delegate?.id !== ethers.constants.AddressZero,
      selfDelegated:
        address.toLowerCase() === subgraphData?.tokenHolder?.delegate?.id?.toLowerCase(),
      hasBalance: Number(subgraphData?.tokenHolder?.tokenBalance) > 0
    }
  } catch (error) {
    console.error(JSON.stringify(error, undefined, 2))
    return null
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
          delegatedVotesRaw
        }
        tokenBalance
      }
    }
  `
}
