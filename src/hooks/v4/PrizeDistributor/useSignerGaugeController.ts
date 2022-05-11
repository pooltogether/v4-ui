import { GaugeController } from '@pooltogether/v4-client-js'
import {
  useUsersAddress,
  useWalletSigner,
  useIsWalletConnected,
  useWalletChainId
} from '@pooltogether/wallet-connection'
import { useMemo } from 'react'

/**
 * Returns a GaugeController built with a Signer from the users wallet
 * @param gaugeController
 * @returns
 */
export const useSignerGaugeController = (gaugeController: GaugeController) => {
  const isWalletConnected = useIsWalletConnected()
  const usersAddress = useUsersAddress()
  const signer = useWalletSigner()
  const walletChainId = useWalletChainId()

  return useMemo(() => {
    const enabled = isWalletConnected && !!signer && !!usersAddress && !!gaugeController
    if (!enabled) return null
    return new GaugeController(
      gaugeController.gaugeControllerMetadata,
      signer,
      gaugeController.contractMetadataList
    )
  }, [isWalletConnected, signer, usersAddress, gaugeController, walletChainId])
}
