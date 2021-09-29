import { useOnboard } from '@pooltogether/bnc-onboard-hooks'
import { Player, PrizePool } from '@pooltogether/v4-js-client'
import { NO_REFETCH } from 'lib/constants/queryKeys'
import { useQuery, UseQueryOptions } from 'react-query'

export const usePlayer = (prizePool: PrizePool) => {
  const { isWalletConnected, provider, address, network: walletChainId } = useOnboard()
  const enabled = isWalletConnected && Boolean(address) && Boolean(prizePool)
  return useQuery(
    ['usePlayer', prizePool?.id(), address, walletChainId],
    async () => {
      const signer = provider.getSigner()
      const player = new Player(signer, prizePool)
      return player
    },
    { ...NO_REFETCH, enabled } as UseQueryOptions<Player>
  )
}
