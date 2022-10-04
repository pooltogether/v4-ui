import { usePrizePoolsByTvl } from '@hooks/usePrizePoolsByTvl'
import { useSelectedPrizePoolAddress } from '@hooks/useSelectedPrizePoolAddress'
import { PrizePool } from '@pooltogether/v4-client-js'
import { TopPool } from '.'

export const TopPoolByTvl: React.FC<{
  className?: string
  onPrizePoolSelect?: (prizePool: PrizePool) => void
}> = (props) => {
  const { onPrizePoolSelect, className } = props
  const { setSelectedPrizePoolAddress } = useSelectedPrizePoolAddress()
  const { isFetched, prizePools } = usePrizePoolsByTvl()
  const prizePool = prizePools?.[0]

  return (
    <TopPool
      className={className}
      isFetched={isFetched}
      title={'Most Popular'}
      description={"By depositing here you're joining the largest Prize Pool on PoolTogether."}
      prizePool={prizePool}
      onClick={(prizePool) => {
        if (!!onPrizePoolSelect) {
          onPrizePoolSelect(prizePool)
        } else {
          setSelectedPrizePoolAddress(prizePool)
        }
      }}
    />
  )
}
