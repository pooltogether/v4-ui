import { useTranslation } from 'react-i18next'

import { InfoListItem } from '.'
import { useV4Apr } from '@hooks/v4/useV4Apr'

interface EstimatedAPRItemProps {
  chainId: number
  labelClassName?: string
  valueClassName?: string
}

/**
 * TODO: Expand this calculation for different prize distributions.
 * @param props
 * @returns
 */
export const EstimatedAPRItem = (props: EstimatedAPRItemProps) => {
  const { labelClassName, valueClassName } = props
  const { data: apr, isFetched } = useV4Apr()
  const { t } = useTranslation()
  return (
    <InfoListItem
      labelClassName={labelClassName}
      valueClassName={valueClassName}
      label={t('estimatedAverageApr', 'Estimated average APR')}
      labelToolTip={t(
        'estimatedAverageAprTooltip',
        'Estimated average APR is a rough estimate based on the current TVL and daily prizes'
      )}
      loading={!isFetched}
      labelLink='https://docs.pooltogether.com/faq/prizes-and-winning#what-is-the-prize-apr'
      value={`${apr}%`}
    />
  )
}
