import { getChain } from '@pooltogether/wallet-connection'
import { getV4SupportedChainIds } from './getV4SupportedChainIds'

export const getV4SupportedChains = () => {
  return getV4SupportedChainIds().map(getChain)
}
