import { contract } from '@pooltogether/etherplex'

import { CONTRACT_ADDRESSES } from 'lib/constants'
import GovernorAlphaABI from 'abis/GovernorAlphaABI'
import { useGovernanceChainId } from 'lib/hooks/useGovernanceChainId'

export function useEtherplexGovernanceContract() {
  const chainId = useGovernanceChainId()
  const governanceAddress = CONTRACT_ADDRESSES[chainId]?.GovernorAlpha
  return contract('GovernorAlpha', GovernorAlphaABI, governanceAddress)
}
