import { NumberOfPrizes } from '@components/PrizePool/NumberOfPrizes'
import { usePrizePoolsByPrizes } from '@hooks/usePrizePoolsByPrizes'
import { PrizePool } from '@pooltogether/v4-client-js'
import { PrizePoolHorizontalList } from '.'

export const HorizontalListByPrizes: React.FC<{
  className?: string
  onClick?: (prizePool: PrizePool) => void
  marginClassName?: string
}> = (props) => {
  const { onClick, className, marginClassName } = props
  const { isPartiallyFetched, isFetched, prizePools } = usePrizePoolsByPrizes()

  return (
    <PrizePoolHorizontalList
      label='by-prizes'
      className={className}
      marginClassName={marginClassName}
      onPrizePoolSelect={onClick}
      prizePools={prizePools}
      isPartiallyFetched={isPartiallyFetched}
      isFetched={isFetched}
      prizePoolCardContent={({ prizePool }) => <NumberOfPrizes prizePool={prizePool} />}
    />
  )
}
