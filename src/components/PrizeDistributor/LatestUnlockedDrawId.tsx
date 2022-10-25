import { useLatestUnlockedDrawId } from '@hooks/v4/PrizeDistributor/useLatestUnlockedDrawId'
import { PrizeDistributor } from '@pooltogether/v4-client-js'

export const LatestUnlockedDrawId = (props: { prizeDistributor: PrizeDistributor }) => {
  const { prizeDistributor } = props
  const { drawId } = useLatestUnlockedDrawId(prizeDistributor)
  return <>{drawId}</>
}
