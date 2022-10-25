import { YieldSourceIcon, YieldSourceKey } from '@pooltogether/react-components'
import { PrizePool } from '@pooltogether/v4-client-js'

export const YieldSourceLabel: React.FC<{ prizePool: PrizePool }> = (props) => {
  return (
    <div className='flex space-x-1 items-center'>
      <span>Aave</span>
      <YieldSourceIcon yieldSource={YieldSourceKey.aave} sizeClassName='w-3 h-3 sm:w-4 sm:h-4' />
    </div>
  )
}
