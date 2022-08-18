import { usePrizePoolsByTvl } from '@hooks/usePrizePoolsByTvl'
import { PrizePool } from '@pooltogether/v4-client-js'
import classNames from 'classnames'
import { useTranslation } from 'react-i18next'
import { PrizePoolHorizontalList } from '.'
import { PrizePoolCard, PrizePoolCardLoader, TotalValueLocked } from '../../PrizePoolCard'

export const HorizontalListByTvl: React.FC<{
  className?: string
  onClick?: (prizePool: PrizePool) => void
  marginClassName?: string
}> = (props) => {
  const { onClick, className, marginClassName } = props
  const { isPartiallyFetched, isFetched, prizePools } = usePrizePoolsByTvl()

  return (
    <PrizePoolHorizontalList
      label='by-tvl'
      className={className}
      marginClassName={marginClassName}
      onClick={onClick}
      prizePools={prizePools}
      isPartiallyFetched={isPartiallyFetched}
      isFetched={isFetched}
      prizePoolCardContent={({ prizePool }) => <TotalValueLocked prizePool={prizePool} />}
    />
  )
}
