import { Draw } from '@pooltogether/v4-js-client'
import { NO_REFETCH } from 'lib/constants/query'
import { useQuery } from 'react-query'
import { useDrawBeaconPeriod } from '../PrizePoolNetwork/useDrawBeaconPeriod'
import { usePrizePoolNetwork } from '../PrizePoolNetwork/usePrizePoolNetwork'

/**
 * Refetches when the draw beacon has updated
 * @returns the draw in the DrawBuffer for the Prize Pool on the Beacon Chain
 */
export const useAllBeaconChainDraws = () => {
  const prizePoolNetwork = usePrizePoolNetwork()
  const { data: drawBeaconPeriod, isFetched: isDrawBeaconFetched } = useDrawBeaconPeriod()
  const enabled = Boolean(prizePoolNetwork) && isDrawBeaconFetched
  return useQuery(
    [
      'useAllBeaconChainDraws',
      prizePoolNetwork?.id(),
      drawBeaconPeriod?.startedAtSeconds.toString()
    ],
    async () => prizePoolNetwork.getBeaconChainDraws(),
    { ...NO_REFETCH, enabled }
  )
}
