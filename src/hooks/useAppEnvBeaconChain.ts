import { useIsTestnets } from '@pooltogether/hooks'
import { CHAIN_ID } from '@constants/misc'

// TODO: Should probably get this from the contract list somehow rather than hardcoding it
export const useAppEnvBeaconChain = () => {
  const { isTestnets } = useIsTestnets()
  return isTestnets ? CHAIN_ID.rinkeby : CHAIN_ID.mainnet
}
