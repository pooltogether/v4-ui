import { useContext } from 'react'
import { useQuery } from 'react-query'

import { AuthControllerContext } from 'lib/components/contextProviders/AuthControllerContextProvider'
import { CONTRACT_ADDRESSES, QUERY_KEYS } from 'lib/constants'
import { useReadProvider } from 'lib/hooks/useReadProvider'
import { batch, contract } from '@pooltogether/etherplex'
import GovernorAlphaABI from 'abis/GovernorAlphaABI'

export function useGovernorAlpha() {
  const { chainId, pauseQueries } = useContext(AuthControllerContext)
  const { readProvider, isLoaded: readProviderIsLoaded } = useReadProvider()

  return useQuery(
    [QUERY_KEYS.governorAlphaDataQuery, chainId],
    async () => {
      return getGovernorAlpha(readProvider, chainId)
    },
    {
      enabled: !pauseQueries && chainId && readProviderIsLoaded,
      refetchInterval: false,
      refetchOnWindowFocus: false
    }
  )
}

async function getGovernorAlpha(readProvider, chainId) {
  try {
    const governorAlphaAddress = CONTRACT_ADDRESSES[chainId].GovernorAlpha
    const governorAlphaContract = contract('governorAlpha', GovernorAlphaABI, governorAlphaAddress)

    const { governorAlpha } = await batch(
      readProvider,
      governorAlphaContract.proposalThreshold().quorumVotes().proposalMaxOperations()
    )

    return {
      proposalThreshold: governorAlpha.proposalThreshold[0],
      quorumVotes: governorAlpha.quorumVotes[0],
      proposalMaxOperations: governorAlpha.proposalMaxOperations[0].toNumber()
    }
  } catch (e) {
    console.error(e.message)
    return
  }
}
