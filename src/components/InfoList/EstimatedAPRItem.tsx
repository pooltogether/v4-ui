import { usePrizePoolApr } from '@hooks/v4/PrizePool/usePrizePoolApr'
import { PrizePool } from '@pooltogether/v4-client-js'
import { useTranslation } from 'react-i18next'
import { InfoListItem } from '.'

interface EstimatedAPRItemProps {
  prizePool: PrizePool
  labelClassName?: string
  valueClassName?: string
}

/**
 *
 * @param props
 * @returns
 */
export const EstimatedAPRItem = (props: EstimatedAPRItemProps) => {
  const { prizePool, labelClassName, valueClassName } = props
  const { data: apr, isFetched, isError } = usePrizePoolApr(prizePool)
  const { t } = useTranslation()
  return (
    <InfoListItem
      labelClassName={labelClassName}
      valueClassName={valueClassName}
      label={t('estimatedAverageApr', 'Estimated average APR')}
      tooltipId='estimatedAverageApr'
      labelToolTip={t(
        'estimatedAverageAprTooltip',
        'Estimated average APR is a rough estimate based on the current TVL and daily prizes'
      )}
      loading={!isFetched || isError}
      labelLink='https://docs.pooltogether.com/faq/prizes-and-winning#what-is-the-prize-apr'
      value={`${apr}%`}
    />
  )
}
