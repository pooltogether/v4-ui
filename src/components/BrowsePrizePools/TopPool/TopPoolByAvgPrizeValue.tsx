import { usePrizePoolsByAvgPrizeValue } from '@hooks/usePrizePoolsByAvgPrizeValue'
import { useSelectedPrizePoolAddress } from '@hooks/useSelectedPrizePoolAddress'
import { PrizePool } from '@pooltogether/v4-client-js'
import { useTranslation } from 'next-i18next'
import { TopPool } from '.'

export const TopPoolByAvgPrizeValue: React.FC<{
  className?: string
  onPrizePoolSelect?: (prizePool: PrizePool) => void
}> = (props) => {
  const { onPrizePoolSelect, className } = props
  const { setSelectedPrizePoolAddress } = useSelectedPrizePoolAddress()
  const { isFetched, prizePools } = usePrizePoolsByAvgPrizeValue()
  const prizePool = prizePools?.[0]
  const { t } = useTranslation()

  return (
    <TopPool
      className={className}
      isFetched={isFetched}
      title={t('largestPrizes')}
      description={t('largestPrizesDescription')}
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
