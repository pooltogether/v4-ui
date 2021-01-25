import { POOLTOGETHER_CURRENT_GOVERNANCE_GRAPH_URIS, QUERY_KEYS } from 'lib/constants'

import { AuthControllerContext } from 'lib/components/contextProviders/AuthControllerContextProvider'
import { ethers } from 'ethers'
import gql from 'graphql-tag'
import { request } from 'graphql-request'
import { testAddress } from 'lib/utils/testAddress'
import { useContext } from 'react'
import { useQuery } from 'react-query'

export function useTokenHolder (address) {
  const { refetch, data, isFetching, isFetched, error } = useFetchTokenHolder(address)

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

function useFetchTokenHolder (address) {
  const { chainId, pauseQueries } = useContext(AuthControllerContext)

  const addressError = testAddress(address)

  return useQuery(
    [QUERY_KEYS.tokenHolderQuery, chainId, address],
    async () => {
      return getTokenHolder(address, chainId)
    },
    {
      enabled: !pauseQueries && chainId && address && !addressError
    }
  )
}

async function getTokenHolder (address, chainId) {
  const query = tokenHolderQuery()

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

const tokenHolderQuery = () => {
  return gql`
    query tokenHolderQuery($id: String!) {
      tokenHolder(id: $id) {
        delegate {
          id
        }
        tokenBalance
      }
    }
  `
}
