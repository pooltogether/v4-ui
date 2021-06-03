import gql from 'graphql-tag'
import { request } from 'graphql-request'
import { useQuery } from 'react-query'
import { ethers } from 'ethers'

import { POOLTOGETHER_SUBGRAPH_URIS, QUERY_KEYS } from 'lib/constants'
import { usePrizePoolContractAddresses } from 'lib/hooks/usePrizePoolContractAddresses'
import { useGovernanceChainId } from 'lib/hooks/useGovernanceChainId'

export const usePrizePools = () => {
  const chainId = useGovernanceChainId()
  const { data: prizePoolContractAddresses, isFetched: prizePoolContractAddressesIsFetched } =
    usePrizePoolContractAddresses()

  return useQuery(
    [QUERY_KEYS.usePools, chainId, prizePoolContractAddresses],
    async () => {
      return getPrizePools(chainId, prizePoolContractAddresses)
    },
    {
      enabled: Boolean(chainId && prizePoolContractAddressesIsFetched),
      refetchInterval: false
    }
  )
}

const getPrizePools = async (chainId, prizePoolContractAddresses) => {
  const query = prizePoolsQuery()

  const prizePoolAddresses = Object.keys(prizePoolContractAddresses)

  const variables = { addresses: prizePoolAddresses.map((address) => address.toLowerCase()) }

  try {
    const subgraphData = await request(POOLTOGETHER_SUBGRAPH_URIS[chainId], query, variables)

    return marshallPoolSubgraphData(subgraphData, prizePoolContractAddresses)
  } catch (error) {
    console.error(JSON.stringify(error, undefined, 2))
    return
  }
}

const prizePoolsQuery = () => {
  return gql`
    query prizePoolsQuery($addresses: [ID!]) {
      prizePools(where: { id_in: $addresses }) {
        id
        underlyingCollateralName
        underlyingCollateralSymbol
      }
    }
  `
}

const marshallPoolSubgraphData = (subgraphData, prizePoolContractAddresses) => {
  const { prizePools } = subgraphData
  const pools = {}

  prizePools.forEach((prizePool) => {
    const prizePoolAddress = prizePool.id
    const prizePoolAddressCheckSummed = ethers.utils.getAddress(prizePoolAddress)
    pools[prizePoolAddress] = {
      ...prizePool,
      ...prizePoolContractAddresses[prizePoolAddressCheckSummed]
    }
  })

  return pools
}
