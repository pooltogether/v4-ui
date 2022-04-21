import { NETWORK } from '@pooltogether/utilities'
import { useWalletChainId } from '@pooltogether/wallet-connection'
import { useMemo } from 'react'

export function useUniswapSupportsNetwork() {
  const walletChainId = useWalletChainId()
  return useMemo(
    () =>
      [
        NETWORK.goerli,
        NETWORK.homestead,
        NETWORK.mainnet,
        NETWORK.kovan,
        NETWORK.matic,
        NETWORK.mumbai,
        NETWORK.optimism,
        NETWORK.polygon,
        NETWORK.rinkeby,
        NETWORK.ropsten
      ].includes(walletChainId),
    [walletChainId]
  )
}
