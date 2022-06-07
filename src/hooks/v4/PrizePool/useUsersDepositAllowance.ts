import { User, PrizePool } from '@pooltogether/v4-client-js'
import { BigNumber } from 'ethers'
import { NO_REFETCH } from '@constants/query'
import { useUsersAddress } from '@pooltogether/wallet-connection'
import { useQuery, UseQueryOptions } from 'react-query'

export const useUsersDepositAllowance = (prizePool: PrizePool) => {
  const usersAddress = useUsersAddress()
  const enabled = Boolean(prizePool) && Boolean(usersAddress)
  return useQuery(
    ['useUsersDepositAllowance', prizePool?.id(), usersAddress],
    async () => {
      const depositAllowance = await prizePool.getUserDepositAllowance(usersAddress)
      return depositAllowance.allowanceUnformatted
    },
    { ...NO_REFETCH, enabled } as UseQueryOptions<BigNumber>
  )
}
