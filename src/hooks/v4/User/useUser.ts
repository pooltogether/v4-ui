import { useMemo } from 'react'
import { useOnboard } from '@pooltogether/bnc-onboard-hooks'
import { User, PrizePool } from '@pooltogether/v4-client-js'

export const useUser = (prizePool: PrizePool) => {
  const { provider } = useOnboard()
  return useMemo(() => {
    if (!provider || !prizePool) return null
    const signer = provider.getSigner()
    return new User(prizePool.prizePoolMetadata, signer, prizePool)
  }, [prizePool?.id(), provider])
}
