import { User, PrizePool } from '@pooltogether/v4-js-client'
import { BigNumber } from 'ethers'
import { NO_REFETCH } from '@src/constants/query'
import { useUsersAddress } from '@src/hooks/useUsersAddress'
import { useQuery, UseQueryOptions } from 'react-query'

export const useUsersDepositAllowance = (prizePool: PrizePool) => {
  const usersAddress = useUsersAddress()
  const enabled = Boolean(prizePool) && Boolean(usersAddress)
  return useQuery(
    ['useUsersDepositAllowance', prizePool?.id(), usersAddress],
    async () => {
      const depositAllowance = await prizePool.getUsersDepositAllowance(usersAddress)
      return depositAllowance.allowanceUnformatted
    },
    { ...NO_REFETCH, enabled } as UseQueryOptions<BigNumber>
  )
}
