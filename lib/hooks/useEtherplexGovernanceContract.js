import { useContext } from 'react'
import { contract } from '@pooltogether/etherplex'

import { CONTRACT_ADDRESSES } from 'lib/constants'
import { AuthControllerContext } from 'lib/components/contextProviders/AuthControllerContextProvider'

import GovernorAlphaABI from 'abis/GovernorAlphaABI'

export function useEtherplexGovernanceContract() {
  const { chainId } = useContext(AuthControllerContext)
  const governanceAddress = CONTRACT_ADDRESSES[chainId].GovernorAlpha
  return contract('GovernorAlpha', GovernorAlphaABI, governanceAddress)
}
