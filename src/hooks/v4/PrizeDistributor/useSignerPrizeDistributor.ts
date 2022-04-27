import { PrizeDistributor } from '@pooltogether/v4-client-js'
import {
  useUsersAddress,
  useWalletSigner,
  useIsWalletConnected,
  useWalletChainId
} from '@pooltogether/wallet-connection'
import { useMemo } from 'react'

/**
 * Returns a PrizeDistributor built with a Signer from the users wallet
 * @param prizeDistributor
 * @returns
 */
export const useSignerPrizeDistributor = (prizeDistributor: PrizeDistributor) => {
  const isWalletConnected = useIsWalletConnected()
  const usersAddress = useUsersAddress()
  const signer = useWalletSigner()
  const walletChainId = useWalletChainId()

  return useMemo(() => {
    const enabled =
      isWalletConnected && !!signer && Boolean(usersAddress) && Boolean(prizeDistributor)
    if (!enabled) return null
    return new PrizeDistributor(
      prizeDistributor.prizeDistributorMetadata,
      signer,
      prizeDistributor.contractMetadataList
    )
  }, [isWalletConnected, signer, usersAddress, prizeDistributor, walletChainId])
}
