import { usePrizePoolsByAvgPrizeValue } from '@hooks/usePrizePoolsByAvgPrizeValue'
import { useSelectedPrizePoolAddress } from '@hooks/useSelectedPrizePoolAddress'
import { PrizePool } from '@pooltogether/v4-client-js'
import { TopPool } from '.'

export const TopPoolByAvgPrizeValue: React.FC<{
  className?: string
  onPrizePoolSelect?: (prizePool: PrizePool) => void
}> = (props) => {
  const { onPrizePoolSelect, className } = props
  const { setSelectedPrizePoolAddress } = useSelectedPrizePoolAddress()
  const { isFetched, prizePools } = usePrizePoolsByAvgPrizeValue()
  const prizePool = prizePools?.[0]

  return (
    <TopPool
      className={className}
      isFetched={isFetched}
      title={'Largest Prizes'}
      description={"Don't expect to win often, but when you do, it'll be big!"}
      prizePool={prizePool}
      onClick={async (prizePool) => {
        if (!!onPrizePoolSelect) {
          onPrizePoolSelect(prizePool)
        } else {
          setSelectedPrizePoolAddress(prizePool)
        }
      }}
    />
  )
}
