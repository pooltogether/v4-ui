import { Player } from '.yalc/@pooltogether/v4-js-client/dist'
import { BigNumber } from 'ethers'
import { NO_REFETCH } from 'lib/constants/queryKeys'
import { useQuery, UseQueryOptions } from 'react-query'

export interface DepositAllowance {
  allowanceUnformatted: BigNumber
  isApproved: boolean
}

export const usePlayersDepositAllowance = (player: Player) => {
  const enabled = Boolean(player)
  return useQuery(
    'useHasPlayerApproved',
    async () => {
      if (!player) return null
      return await player.getPlayersDepositAllowance()
    },
    { ...NO_REFETCH, enabled } as UseQueryOptions<DepositAllowance>
  )
}
