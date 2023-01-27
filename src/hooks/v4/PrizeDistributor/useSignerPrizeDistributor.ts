import { PrizeDistributor } from '@pooltogether/v4-client-js'
import {
  useUsersAddress,
  useIsWalletConnected,
  useWalletChainId
} from '@pooltogether/wallet-connection'
import { useMemo } from 'react'
import { useSigner } from 'wagmi'

/**
 * Returns a PrizeDistributor built with a Signer from the users wallet
 * @param prizeDistributor
 * @returns
 */
export const useSignerPrizeDistributor = (prizeDistributor: PrizeDistributor) => {
  const isWalletConnected = useIsWalletConnected()
  const usersAddress = useUsersAddress()
  const { data: signer } = useSigner({ chainId: prizeDistributor.chainId })
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
