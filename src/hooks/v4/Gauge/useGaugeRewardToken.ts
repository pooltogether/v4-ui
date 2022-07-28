import { NO_REFETCH } from '@constants/query'
import { GaugeController } from '@pooltogether/v4-client-js'
import { useQuery } from 'react-query'

export const useGaugeRewardToken = (gaugeController: GaugeController, ticketAddress: string) => {
  return useQuery(
    ['useGaugeRewardToken', gaugeController?.id(), ticketAddress],
    () => gaugeController.getGaugeRewardToken(ticketAddress),
    {
      ...NO_REFETCH,
      enabled: !!gaugeController && !!ticketAddress
    }
  )
}
