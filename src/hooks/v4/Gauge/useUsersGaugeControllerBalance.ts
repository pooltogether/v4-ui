import { NO_REFETCH } from '@constants/query'
import { GaugeController } from '@pooltogether/v4-client-js'
import { useQuery } from 'react-query'

export const useUsersGaugeControllerBalance = (
  usersAddress: string,
  gaugeController: GaugeController
) => {
  return useQuery(
    ['useUsersGaugeControllerBalance', gaugeController?.id(), usersAddress],
    () => gaugeController.getGaugeControllerBalance(usersAddress),
    { ...NO_REFETCH, enabled: !!gaugeController && !!usersAddress }
  )
}
