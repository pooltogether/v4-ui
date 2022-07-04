import { GaugeController } from '@pooltogether/v4-client-js'
import {
  useUsersAddress,
  useIsWalletConnected,
  useWalletChainId
} from '@pooltogether/wallet-connection'
import { useMemo } from 'react'
import { useSigner } from 'wagmi'

/**
 * Returns a GaugeController built with a Signer from the users wallet
 * @param gaugeController
 * @returns
 */
export const useSignerGaugeController = (gaugeController: GaugeController) => {
  const isWalletConnected = useIsWalletConnected()
  const usersAddress = useUsersAddress()
  const { data: signer } = useSigner()
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
