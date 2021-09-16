import { useUsersAddress } from '.yalc/@pooltogether/hooks/dist'
import { Player, PrizePool } from '.yalc/@pooltogether/v4-js-client/dist'
import { BigNumber } from 'ethers'
import { NO_REFETCH } from 'lib/constants/queryKeys'
import { useQuery, UseQueryOptions } from 'react-query'

export interface DepositAllowance {
  allowanceUnformatted: BigNumber
  isApproved: boolean
}

export const useUsersDepositAllowance = (prizePool: PrizePool) => {
  const usersAddress = useUsersAddress()
  const enabled = Boolean(prizePool) && Boolean(usersAddress)
  return useQuery(
    ['useUsersDepositAllowance', prizePool?.id(), usersAddress],
    async () => {
      return await prizePool.getUsersDepositAllowance(usersAddress)
    },
    { ...NO_REFETCH, enabled } as UseQueryOptions<DepositAllowance>
  )
}
