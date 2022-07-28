import { NO_REFETCH } from '@constants/query'
import { GaugeController } from '@pooltogether/v4-client-js'
import { useQueries, useQuery } from 'react-query'

const getQueryKey = (usersAddress: string, gaugeController: GaugeController) => [
  ['getUsersGaugeDepositAllowances', usersAddress, gaugeController.id()]
]

/**
 *
 * @param usersAddress
 * @param gaugeController
 * @returns
 */
export const useUsersGaugeDepositAllowance = (
  usersAddress: string,
  gaugeController: GaugeController
) => {
  return useQuery(
    getQueryKey(usersAddress, gaugeController),
    () => getUsersGaugeDepositAllowances(usersAddress, gaugeController),
    {
      ...NO_REFETCH,
      enabled: !!usersAddress && !!gaugeController
    }
  )
}

/**
 *
 * @param usersAddress
 * @param gaugeControllers
 * @returns
 */
export const useAllUsersGaugeDepositAllowances = (
  usersAddress: string,
  gaugeControllers: GaugeController[]
) => {
  return useQueries(
    gaugeControllers.map((gaugeController) => ({
      ...NO_REFETCH,
      queryKey: getQueryKey(usersAddress, gaugeController),
      queryFn: () => getUsersGaugeDepositAllowances(usersAddress, gaugeController)
    }))
  )
}

const getUsersGaugeDepositAllowances = async (usersAddress, gaugeController: GaugeController) =>
  gaugeController.getUserDepositAllowance(usersAddress)
