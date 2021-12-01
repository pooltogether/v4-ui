import { useQuery, UseQueryOptions } from 'react-query'
import { useOnboard } from '@pooltogether/bnc-onboard-hooks'
import { User, PrizePool } from '@pooltogether/v4-js-client'

import { NO_REFETCH } from 'lib/constants/query'

export const useUser = (prizePool: PrizePool) => {
  const { isWalletConnected, provider, address, network: walletChainId } = useOnboard()
  const enabled = isWalletConnected && Boolean(address) && Boolean(prizePool)
  return useQuery(
    ['useUser', prizePool?.id(), address, walletChainId],
    async () => {
      const signer = provider.getSigner()
      return new User(prizePool.prizePoolMetadata, signer, prizePool)
    },
    { ...NO_REFETCH, enabled } as UseQueryOptions<User>
  )
}
