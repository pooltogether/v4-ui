import { useOnboard } from '@pooltogether/bnc-onboard-hooks'
import { NETWORK } from '@pooltogether/utilities'
import { useMemo } from 'react'

export function useUniswapSupportsNetwork() {
  const { network: walletChainId } = useOnboard()
  return useMemo(
    () =>
      [
        NETWORK.goerli,
        NETWORK.homestead,
        NETWORK.mainnet,
        NETWORK.kovan,
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
