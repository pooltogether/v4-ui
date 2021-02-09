import gql from 'graphql-tag'
import { request } from 'graphql-request'
import { AuthControllerContext } from 'lib/components/contextProviders/AuthControllerContextProvider'
import { POOLTOGETHER_SUBGRAPH_URIS, QUERY_KEYS } from 'lib/constants'
import { usePrizePoolAddresses } from 'lib/hooks/usePrizePoolAddresses'
import { useContext } from 'react'
import { useQuery } from 'react-query'

export const usePrizePools = () => {
  const addresses = usePrizePoolAddresses()
  const { pauseQueries, chainId } = useContext(AuthControllerContext)

  return useQuery(
    [QUERY_KEYS.usePools, chainId, addresses],
    async () => {
      return getPrizePools(chainId, addresses)
    },
    {
      enabled: !pauseQueries && chainId,
      refetchInterval: false
    }
  )
}

const getPrizePools = async (chainId, addresses) => {
  const query = prizePoolsQuery()

  const variables = { addresses: addresses.map((address) => address.toLowerCase()) }

  try {
    const subgraphData = await request(POOLTOGETHER_SUBGRAPH_URIS[chainId], query, variables)

    return marshallPoolSubgraphData(subgraphData)
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
        underlyingCollateralToken
      }
    }
  `
}

const marshallPoolSubgraphData = (subgraphData) => {
  const { prizePools } = subgraphData
  return prizePools
}
