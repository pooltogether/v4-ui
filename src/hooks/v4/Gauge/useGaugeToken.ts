import { NO_REFETCH } from '@constants/query'
import { GaugeController } from '@pooltogether/v4-client-js'
import { useQuery } from 'react-query'

export const useGaugeToken = (gaugeController: GaugeController) => {
  return useQuery(
    ['useGaugeToken', gaugeController?.id()],
    () => gaugeController.getGaugeTokenData(),
    {
      ...NO_REFETCH,
      enabled: !!gaugeController
    }
  )
}
