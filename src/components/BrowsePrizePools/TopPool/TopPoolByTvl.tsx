import { usePrizePoolsByTvl } from '@hooks/usePrizePoolsByTvl'
import { useSelectedPrizePoolAddress } from '@hooks/useSelectedPrizePoolAddress'
import { PrizePool } from '@pooltogether/v4-client-js'
import { useTranslation } from 'next-i18next'
import { TopPool } from '.'

export const TopPoolByTvl: React.FC<{
  className?: string
  onPrizePoolSelect?: (prizePool: PrizePool) => void
}> = (props) => {
  const { onPrizePoolSelect, className } = props
  const { setSelectedPrizePoolAddress } = useSelectedPrizePoolAddress()
  const { isFetched, prizePools } = usePrizePoolsByTvl()
  const prizePool = prizePools?.[0]
  const { t } = useTranslation()

  return (
    <TopPool
      className={className}
      isFetched={isFetched}
      title={t('mostDeposits')}
      description={t('mostPopularDescription')}
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
