import { useUsersAddress } from '@pooltogether/hooks'
import { PrizePool } from '.yalc/@pooltogether/v4-js-client/dist'
import { sToMs } from '@pooltogether/utilities'
import { BigNumber } from 'ethers'
import { QueryKey, useQuery, UseQueryOptions } from 'react-query'

const useGasEstimate = (
  queryKey: QueryKey,
  _enabled: boolean,
  fetchGasEstimate: () => Promise<BigNumber>
) =>
  useQuery(
    queryKey,
    async () => {
      try {
        return await fetchGasEstimate()
      } catch (e) {
        return null
      }
    },
    { refetchInterval: sToMs(60), enabled: _enabled } as UseQueryOptions<BigNumber>
  )

export const useDepositGasEstimate = (prizePool: PrizePool, amount: BigNumber) => {
  const usersAddress = useUsersAddress()
  const enabled =
    Boolean(prizePool) &&
    Boolean(usersAddress) &&
    Boolean(amount) &&
    amount._isBigNumber &&
    !amount.isZero() &&
    !amount.isNegative()

  return useGasEstimate(
    ['useDepositGasEstimate', prizePool?.id(), usersAddress, amount?.toString()],
    enabled,
    () => prizePool.getDepositGasEstimate(usersAddress, amount)
  )
}

export const useWithdrawGasEstimate = (prizePool: PrizePool, amount: BigNumber) => {
  const usersAddress = useUsersAddress()
  const enabled =
    Boolean(prizePool) &&
    Boolean(usersAddress) &&
    Boolean(amount) &&
    amount._isBigNumber &&
    !amount.isZero() &&
    !amount.isNegative()

  return useGasEstimate(
    ['useWithdrawGasEstimate', prizePool?.id(), usersAddress, amount?.toString()],
    enabled,
    () => prizePool.getWithdrawGasEstimate(usersAddress, amount)
  )
}

export const useApproveDepositsGasEstimate = (prizePool: PrizePool) => {
  const usersAddress = useUsersAddress()
  const enabled = Boolean(prizePool) && Boolean(usersAddress)

  return useGasEstimate(
    ['useApproveDepositGasEstimate', prizePool?.id(), usersAddress],
    enabled,
    () => prizePool.getApprovalGasEstimate(usersAddress)
  )
}
