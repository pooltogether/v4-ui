import { PrizeDistributorV2 } from '@pooltogether/v4-client-js'
import {
  useUsersAddress,
  useWalletSigner,
  useIsWalletConnected,
  useWalletChainId
} from '@pooltogether/wallet-connection'
import { useMemo } from 'react'

/**
 * Returns a PrizeDistributorV2 built with a Signer from the users wallet
 * @param prizeDistributor
 * @returns
 */
export const useSignerPrizeDistributor = (prizeDistributor: PrizeDistributorV2) => {
  const isWalletConnected = useIsWalletConnected()
  const usersAddress = useUsersAddress()
  const signer = useWalletSigner()
  const walletChainId = useWalletChainId()

  return useMemo(() => {
    const enabled =
      isWalletConnected && !!signer && Boolean(usersAddress) && Boolean(prizeDistributor)
    if (!enabled) return null
    return new PrizeDistributorV2(
      prizeDistributor.prizeDistributorMetadata,
      signer,
      prizeDistributor.contractMetadataList
    )
  }, [isWalletConnected, signer, usersAddress, prizeDistributor, walletChainId])
}
