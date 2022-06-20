import { useTranslation } from 'react-i18next'
import { InfoListItem } from '.'
import { usePrizePoolBySelectedChainId } from '@hooks/v4/PrizePool/usePrizePoolBySelectedChainId'
import { usePrizePoolApr } from '@hooks/v4/PrizePool/usePrizePoolApr'
import { PrizePool } from '@pooltogether/v4-client-js'

/**
 *
 * @param props
 * @returns
 */
export const PrizePoolAPRItem: React.FC<{
  prizePool: PrizePool
  labelClassName?: string
  valueClassName?: string
}> = (props) => {
  const { prizePool, labelClassName, valueClassName } = props
  const { data: apr, isFetched } = usePrizePoolApr(prizePool)
  const { t } = useTranslation()
  return (
    <InfoListItem
      labelClassName={labelClassName}
      valueClassName={valueClassName}
      label={'Prize Pool APR'}
      labelToolTip={
        'Estimated Prize Pool APR is a rough estimate based on the current TVL of the selected Prize Pool and the daily prizes for it'
      }
      loading={!isFetched}
      labelLink='https://docs.pooltogether.com/welcome/faq#what-is-the-prize-apr'
      value={`${apr}%`}
    />
  )
}
