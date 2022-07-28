import { NO_REFETCH } from '@constants/query'
import { GaugeController } from '@pooltogether/v4-client-js'
import { useQuery } from 'react-query'

const getQueryKey = (usersAddress: string, gaugeController: GaugeController) => [
  'useUsersGaugeTokenBalance',
  gaugeController?.id(),
  usersAddress
]

export const useUsersGaugeTokenBalance = (
  usersAddress: string,
  gaugeController: GaugeController
) => {
  return useQuery(
    getQueryKey(usersAddress, gaugeController),
    () => getUsersGaugeTokenBalance(usersAddress, gaugeController),
    { ...NO_REFETCH, enabled: !!gaugeController && !!usersAddress }
  )
}

const getUsersGaugeTokenBalance = (usersAddress: string, gaugeController: GaugeController) =>
  gaugeController.getUserGaugeTokenBalance(usersAddress)
