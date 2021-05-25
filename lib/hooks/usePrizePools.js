import gql from 'graphql-tag'
import { request } from 'graphql-request'
import { useOnboard } from '@pooltogether/hooks'
import { POOLTOGETHER_SUBGRAPH_URIS, QUERY_KEYS } from 'lib/constants'
import { useQuery } from 'react-query'
import { usePrizePoolContractAddresses } from 'lib/hooks/usePrizePoolContractAddresses'
import { ethers } from 'ethers'

export const usePrizePools = () => {
  const { network: chainId } = useOnboard()
  const { data: prizePoolContractAddresses, isFetched: prizePoolContractAddressesIsFetched } =
    usePrizePoolContractAddresses()

  return useQuery(
    [QUERY_KEYS.usePools, chainId, prizePoolContractAddresses],
    async () => {
      return getPrizePools(chainId, prizePoolContractAddresses)
    },
    {
      enabled: chainId && prizePoolContractAddressesIsFetched,
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
