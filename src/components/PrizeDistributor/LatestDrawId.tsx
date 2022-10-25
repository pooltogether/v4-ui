import { useValidDrawIds } from '@hooks/v4/PrizeDistributor/useValidDrawIds'
import { PrizeDistributor } from '@pooltogether/v4-client-js'

export const LatestDrawId = (props: { prizeDistributor: PrizeDistributor }) => {
  const { prizeDistributor } = props
  const { data } = useValidDrawIds(prizeDistributor)
  const drawId = data?.drawIds[data?.drawIds.length - 1]
  return <>{drawId}</>
}
