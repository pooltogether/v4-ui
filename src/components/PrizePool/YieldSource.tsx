import { getYieldSourceNiceName, YieldSourceKey } from '@pooltogether/react-components'
import { PrizePool } from '@pooltogether/v4-client-js'

export const YieldSource = (props: { prizePool: PrizePool }) => {
  return <>{getYieldSourceNiceName(YieldSourceKey.aave)}</>
}
