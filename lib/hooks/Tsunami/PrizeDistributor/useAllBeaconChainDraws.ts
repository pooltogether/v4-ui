import { Draw } from '@pooltogether/v4-js-client'
import { NO_REFETCH } from 'lib/constants/query'
import { useQuery } from 'react-query'
import { useDrawBeaconPeriod } from '../LinkedPrizePool/useDrawBeaconPeriod'
import { useLinkedPrizePool } from '../LinkedPrizePool/useLinkedPrizePool'

/**
 * Refetches when the draw beacon has updated
 * @returns the draw in the DrawBuffer for the Prize Pool on the Beacon Chain
 */
export const useAllBeaconChainDraws = () => {
  const linkedPrizePool = useLinkedPrizePool()
  const { data: drawBeaconPeriod, isFetched: isDrawBeaconFetched } = useDrawBeaconPeriod()
  const enabled = Boolean(linkedPrizePool) && isDrawBeaconFetched
  return useQuery(
    [
      'useAllBeaconChainDraws',
      linkedPrizePool?.id(),
      drawBeaconPeriod?.startedAtSeconds.toString()
    ],
    async () => {
      const drawsList = await linkedPrizePool.getBeaconChainDraws()
      const draws: { [drawId: number]: Draw } = {}
      drawsList.forEach((draw) => (draws[draw.drawId] = draw))
      return draws
    },
    { ...NO_REFETCH, enabled }
  )
}
