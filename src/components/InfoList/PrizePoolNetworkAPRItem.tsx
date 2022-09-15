import { usePrizePoolNetworkApr } from '@hooks/v4/PrizePoolNetwork/usePrizePoolNetworkApr'
import { getMinPrecision, numberWithCommas } from '@pooltogether/utilities'
import { useTranslation } from 'react-i18next'

import { InfoListItem } from '.'

/**
 *
 * @param props
 * @returns
 */
export const PrizePoolNetworkAPRItem: React.FC<{
  labelClassName?: string
  valueClassName?: string
}> = (props) => {
  const { labelClassName, valueClassName } = props
  const { data: apr, isFetched } = usePrizePoolNetworkApr()
  const { t } = useTranslation()
  return (
    <InfoListItem
      labelClassName={labelClassName}
      valueClassName={valueClassName}
      label={t('networkApr', 'Network APR')}
      labelToolTip={t(
        'networkAprDescription',
        'Estimated Prize Pool Network APR is a rough estimate based on the current TVL of the entire Prize Pool Network and daily prizes for all prize pools'
      )}
      loading={!isFetched}
      labelLink='https://docs.pooltogether.com/welcome/faq#what-is-the-prize-apr'
      value={`${numberWithCommas(apr)}%`}
    />
  )
}

PrizePoolNetworkAPRItem.defaultProps = {
  labelClassName: '',
  valueClassName: ''
}
