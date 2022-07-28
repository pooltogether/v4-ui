import { NO_REFETCH } from '@constants/query'
import { GaugeController } from '@pooltogether/v4-client-js'
import { useQuery } from 'react-query'

export const useUsersClaimableGaugeRewardBalance = (
  usersAddress: string,
  gaugeController: GaugeController,
  ticketAddress: string,
  rewardTokenAddress: string
) => {
  return useQuery(
    [
      'useUsersClaimableGaugeRewardBalance',
      gaugeController?.id(),
      usersAddress,
      ticketAddress,
      rewardTokenAddress
    ],
    () =>
      gaugeController.getUserClaimableGaugeRewardBalance(
        usersAddress,
        ticketAddress,
        rewardTokenAddress
      ),
    {
      ...NO_REFETCH,
      enabled: !!gaugeController && !!ticketAddress && !!usersAddress && !!rewardTokenAddress
    }
  )
}
