import { useContext } from 'react'
import { useQuery } from 'react-query'

import { AuthControllerContext } from 'lib/components/contextProviders/AuthControllerContextProvider'
import { CONTRACT_ADDRESSES, QUERY_KEYS } from 'lib/constants'
import { useReadProvider } from 'lib/hooks/useReadProvider'
import { batch, contract } from '@pooltogether/etherplex'
import GovernorAlphaABI from 'abis/GovernorAlphaABI'

export function useGovernorAlphaData () {
  const { chainId, pauseQueries } = useContext(AuthControllerContext)
  const { readProvider, isLoaded: readProviderIsLoaded } = useReadProvider()

  return useQuery(
    [QUERY_KEYS.governorAlphaDataQuery, chainId],
    async () => {
      return getGovernorAlphaData(readProvider, chainId)
    },
    {
      enabled: !pauseQueries && chainId && readProviderIsLoaded,
      refetchInterval: false,
      refetchOnWindowFocus: false
    }
  )
}

async function getGovernorAlphaData (readProvider, chainId) {
  try {
    const governorAlphaAddress = CONTRACT_ADDRESSES[chainId].GovernorAlpha
    const governorAlphaContract = contract('governorAlpha', GovernorAlphaABI, governorAlphaAddress)

    const { governorAlpha } = await batch(
      readProvider,
      governorAlphaContract.proposalThreshold().quorumVotes()
    )

    console.log(governorAlpha)

    return {
      proposalThreshold: governorAlpha.proposalThreshold[0],
      quorumVotes: governorAlpha.quorumVotes[0]
    }
  } catch (e) {
    console.error(e.message)
    return
  }
}
