import { PrizePool } from '@pooltogether/v4-client-js'
import { BigNumber } from 'ethers'
import { useUsersAddress } from '@pooltogether/wallet-connection'
import { useRefetchInterval } from '@pooltogether/hooks'
import { useQuery, UseQueryOptions } from 'react-query'

export const useUsersDepositAllowance = (prizePool: PrizePool) => {
  const usersAddress = useUsersAddress()
  const enabled = Boolean(prizePool) && Boolean(usersAddress)
  const refetchInterval = useRefetchInterval()

  return useQuery(
    ['useUsersDepositAllowance', prizePool?.id(), usersAddress],
    async () => {
      const depositAllowance = await prizePool.getUsersDepositAllowance(usersAddress)
      return depositAllowance.allowanceUnformatted
    },
    {
      refetchInterval,
      refetchIntervalInBackground: false,
      refetchOnMount: false,
      refetchOnWindowFocus: false,
      enabled
    } as UseQueryOptions<BigNumber>
  )
}
