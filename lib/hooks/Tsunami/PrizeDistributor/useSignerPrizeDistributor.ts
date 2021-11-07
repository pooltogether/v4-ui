import { useOnboard } from '@pooltogether/bnc-onboard-hooks'
import { PrizeDistributor } from '@pooltogether/v4-js-client'
import { useMemo } from 'react'

export const useSignerPrizeDistributor = (prizeDistributor: PrizeDistributor) => {
  const { isWalletConnected, provider, address, network: walletChainId } = useOnboard()
  return useMemo(() => {
    const enabled = isWalletConnected && Boolean(address) && Boolean(prizeDistributor)
    if (!enabled) return null
    const signer = provider.getSigner()
    return new PrizeDistributor(
      prizeDistributor.prizeDistributorMetadata,
      signer,
      prizeDistributor.contractMetadataList
    )
  }, [isWalletConnected, address, prizeDistributor, walletChainId])
}
