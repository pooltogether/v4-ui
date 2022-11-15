import { useSelectedPrizePoolAddress } from '@hooks/useSelectedPrizePoolAddress'
import { usePrizePool } from '@hooks/v4/PrizePool/usePrizePool'
import { PrizePool } from '@pooltogether/v4-client-js'
import { CHAIN_ID } from '@pooltogether/wallet-connection'
import { useTranslation } from 'next-i18next'
import { TopPool } from '.'

export const TopPoolByGas: React.FC<{
  className?: string
  onPrizePoolSelect?: (prizePool: PrizePool) => void
}> = (props) => {
  const { t } = useTranslation()
  const { onPrizePoolSelect, className } = props
  const { setSelectedPrizePoolAddress } = useSelectedPrizePoolAddress()

  // This is currently hardcoded to Polygon's V4 USDC pool.
  // Once there are more pools per chain this will have to be refactored.
  const prizePool = usePrizePool(CHAIN_ID.polygon, '0x19DE635fb3678D8B8154E37d8C9Cdf182Fe84E60')

  return (
    <TopPool
      className={className}
      isFetched={true}
      title={t('lowestNetworkFees')}
      description={t('lowestNetworkFeesDescription')}
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
