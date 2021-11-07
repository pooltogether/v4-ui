import { useQuery, UseQueryOptions } from 'react-query'
import { useOnboard } from '@pooltogether/bnc-onboard-hooks'
import { Player, PrizePool } from '@pooltogether/v4-js-client'

import { NO_REFETCH } from 'lib/constants/query'

export const usePlayer = (prizePool: PrizePool) => {
  const { isWalletConnected, provider, address, network: walletChainId } = useOnboard()
  const enabled = isWalletConnected && Boolean(address) && Boolean(prizePool)
  return useQuery(
    ['usePlayer', prizePool?.id(), address, walletChainId],
    async () => {
      const signer = provider.getSigner()
      return new Player(prizePool.prizePoolMetadata, signer, prizePool)
    },
    { ...NO_REFETCH, enabled } as UseQueryOptions<Player>
  )
}
