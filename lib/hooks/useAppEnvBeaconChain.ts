import { useIsTestnets } from '@pooltogether/hooks'
import { NETWORK } from '@pooltogether/utilities'

// TODO: Should probably get this from the contract list somehow rather than hardcoding it
export const useAppEnvBeaconChain = () => {
  const { isTestnets } = useIsTestnets()
  return isTestnets ? NETWORK.rinkeby : NETWORK.mainnet
}
