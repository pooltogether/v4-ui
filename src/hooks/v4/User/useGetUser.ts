import { User, PrizePool } from '@pooltogether/v4-client-js'
import { useSigner } from 'wagmi'

/**
 * Returns a User built with a Signer from the users wallet
 * @param prizePool
 * @returns
 */
export const useGetUser = (prizePool: PrizePool) => {
  const { refetch: getSigner } = useSigner({ chainId: prizePool.chainId })
  return async () => {
    const { data: signer } = await getSigner()
    return new User(prizePool.prizePoolMetadata, signer, prizePool)
  }
}
