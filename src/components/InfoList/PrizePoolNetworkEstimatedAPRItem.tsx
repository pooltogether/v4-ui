import { useTranslation } from 'react-i18next'

import { InfoListItem } from '.'
import { usePrizePoolApr } from '@hooks/v4/usePrizePoolNetworkApr'
import { usePrizePoolBySelectedChainId } from '@hooks/v4/PrizePool/usePrizePoolBySelectedChainId'

interface PrizePoolNetworkEstimatedAPRItemProps {
  chainId: number
  labelClassName?: string
  valueClassName?: string
}

/**
 *
 * @param props
 * @returns
 */
export const PrizePoolNetworkEstimatedAPRItem = (props: PrizePoolNetworkEstimatedAPRItemProps) => {
  const { labelClassName, valueClassName } = props
  const prizePool = usePrizePoolBySelectedChainId()
  const { data: apr, isFetched } = usePrizePoolApr(prizePool)
  const { t } = useTranslation()
  return (
    <InfoListItem
      labelClassName={labelClassName}
      valueClassName={valueClassName}
      label={'Estimated Prize Pool Network APR'}
      labelToolTip={
        'Estimated Prize Pool Network APR is a rough estimate based on the current TVL of the entire Prize Pool Network and daily prizes for all prize pools'
      }
      loading={!isFetched}
      labelLink='https://docs.pooltogether.com/welcome/faq#what-is-the-prize-apr'
      value={`${apr}%`}
    />
  )
}
