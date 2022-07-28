import { NO_REFETCH } from '@constants/query'
import { GaugeController } from '@pooltogether/v4-client-js'
import { useQuery } from 'react-query'

export const useUsersRedeemableGaugeRewardBalance = (
  usersAddress: string,
  gaugeController: GaugeController,
  ticketAddress: string
) => {
  return useQuery(
    ['useUsersRedeemableGaugeRewardBalance', gaugeController?.id(), usersAddress, ticketAddress],
    () => gaugeController.getUserRedeemableGaugeRewardBalance(usersAddress, ticketAddress),
    {
      ...NO_REFETCH,
      enabled: !!gaugeController && !!ticketAddress && !!usersAddress
    }
  )
}
