import { usePrizePoolsByPrizes } from '@hooks/usePrizePoolsByPrizes'
import { useSelectedPrizePoolAddress } from '@hooks/useSelectedPrizePoolAddress'
import { PrizePool } from '@pooltogether/v4-client-js'
import { TopPool } from '.'

export const TopPoolByPrizes: React.FC<{
  className?: string
  onPrizePoolSelect?: (prizePool: PrizePool) => void
}> = (props) => {
  const { onPrizePoolSelect, className } = props
  const { setSelectedPrizePoolAddress } = useSelectedPrizePoolAddress()
  const { isFetched, prizePools } = usePrizePoolsByPrizes()
  const prizePool = prizePools?.[0]

  return (
    <TopPool
      className={className}
      isFetched={isFetched}
      title={'Most Prizes'}
      description={'The most prizes are awarded here, but the prizes are smaller.'}
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
