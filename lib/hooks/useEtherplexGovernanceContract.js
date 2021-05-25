import { contract } from '@pooltogether/etherplex'

import { CONTRACT_ADDRESSES } from 'lib/constants'
import { useOnboard } from '@pooltogether/hooks'

import GovernorAlphaABI from 'abis/GovernorAlphaABI'

export function useEtherplexGovernanceContract() {
  const { network: chainId } = useOnboard()
  const governanceAddress = CONTRACT_ADDRESSES[chainId].GovernorAlpha
  return contract('GovernorAlpha', GovernorAlphaABI, governanceAddress)
}
