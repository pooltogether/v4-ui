import { NO_REFETCH } from '@constants/query'
import { GaugeController } from '@pooltogether/v4-client-js'
import { useQuery } from 'react-query'

const getQueryKey = (
  usersAddress: string,
  ticketAddress: string,
  gaugeController: GaugeController
) => [['getGaugeController', gaugeController?.id(), usersAddress, ticketAddress]]

/**
 *
 * @param usersAddress
 * @param ticketAddress
 * @param gaugeController
 * @returns
 */
export const useUsersGaugeBalance = (
  usersAddress: string,
  ticketAddress: string,
  gaugeController: GaugeController
) => {
  return useQuery(
    getQueryKey(usersAddress, ticketAddress, gaugeController),
    () => getUsersGaugeBalance(usersAddress, ticketAddress, gaugeController),
    { ...NO_REFETCH, enabled: !!gaugeController && !!usersAddress && !!ticketAddress }
  )
}

const getUsersGaugeBalance = (
  usersAddress: string,
  ticketAddress: string,
  gaugeController: GaugeController
) => gaugeController.getUserGaugeBalance(usersAddress, ticketAddress)
