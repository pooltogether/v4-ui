import { useOnboard } from '@pooltogether/bnc-onboard-hooks'
import { useMemo } from 'react'

export const useIsWalletOnNetwork = (chainId: number) => {
  const { network } = useOnboard()
  return useMemo(() => chainId === network, [chainId, network])
}
