import { PrizePool } from '@pooltogether/v4-client-js'
import { HorizontalListByOdds } from './PrizePoolHorizontalList/HorizontalListByOdds'
import { HorizontalListByTvl } from './PrizePoolHorizontalList/HorizontalListByTvl'

/**
 * Example: marginClassName='mb-12 px-4 sm:px-6 lg:px-12 -mx-4 sm:-mx-6 lg:-mx-12'
 * @param props
 * @returns
 */
export const TopPrizePoolsHorizontalLists: React.FC<{
  onPrizePoolSelect: (prizePool: PrizePool) => void

  marginClassName?: string
}> = (props) => {
  const { onPrizePoolSelect, marginClassName } = props
  return (
    <div className='space-y-8 sm:space-y-16'>
      <HorizontalListByTvl
        onPrizePoolSelect={onPrizePoolSelect}
        marginClassName={marginClassName}
      />
      <HorizontalListByOdds
        onPrizePoolSelect={onPrizePoolSelect}
        marginClassName={marginClassName}
      />
    </div>
  )
}
