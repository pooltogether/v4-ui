import { useMemo } from 'react'
import { User, PrizePool } from '@pooltogether/v4-client-js'
import { useGetWalletSigner } from '@pooltogether/wallet-connection'

/**
 * Returns a User built with a Signer from the users wallet
 * @param prizePool
 * @returns
 */
export const useGetUser = (prizePool: PrizePool) => {
  const getSigner = useGetWalletSigner()
  return async () => {
    const signer = await getSigner()
    return new User(prizePool.prizePoolMetadata, signer, prizePool)
  }
}
