import { useOnboard } from '@pooltogether/bnc-onboard-hooks'
import { DrawPrize } from '@pooltogether/v4-js-client'
import { useMemo } from 'react'

export const useSignerDrawPrize = (drawPrize: DrawPrize) => {
  const { isWalletConnected, provider, address, network: walletChainId } = useOnboard()
  return useMemo(() => {
    const enabled = isWalletConnected && Boolean(address) && Boolean(drawPrize)
    if (!enabled) return null
    const signer = provider.getSigner()
    return new DrawPrize(signer, drawPrize.contractMetadataList)
  }, [isWalletConnected, address, drawPrize, walletChainId])
}
