import { useOnboard } from '@pooltogether/hooks'
import { useGovernanceChainId } from 'lib/hooks/useGovernanceChainId'

/**
 * Checks if the connected wallet is on the proper network for the current
 * app environment. Used to disable buttons when the user is on the wrong network
 * @returns boolean
 */
export const useIsWalletOnProperNetwork = () => {
  const expectedChainId = useGovernanceChainId()
  const { network: walletChainId } = useOnboard()
  return Boolean(walletChainId) && walletChainId === expectedChainId
}
