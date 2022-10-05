import { YieldSourceLabel } from '@components/YieldSourceLabel'
import { usePrizePoolNetworkApr } from '@hooks/v4/PrizePoolNetwork/usePrizePoolNetworkApr'
import { YieldSourceIcon } from '@pooltogether/react-components'
import { getMinPrecision, numberWithCommas } from '@pooltogether/utilities'
import { PrizePool } from '@pooltogether/v4-client-js'
import { useTranslation } from 'react-i18next'
import { InfoListItem } from '.'

/**
 * TODO: We'll need to actually do this at some point in the future. Hardcode it to Aave for now.
 * @param props
 * @returns
 */
export const PrizePoolYieldSourceItem: React.FC<{
  prizePool: PrizePool
  labelClassName?: string
  valueClassName?: string
}> = (props) => {
  const { labelClassName, valueClassName, prizePool } = props
  const { t } = useTranslation()

  return (
    <InfoListItem
      labelClassName={labelClassName}
      valueClassName={valueClassName}
      label={t('yieldSource', 'Yield source')}
      labelToolTip={t(
        'yieldSourceDescription',
        'All deposits into this prize pool are deposited directly into the yield source to earn money for prizes.'
      )}
      // loading={!isFetched}
      // labelLink='https://docs.pooltogether.com/welcome/faq#what-is-the-prize-apr'
      value={<YieldSourceLabel prizePool={prizePool} />}
    />
  )
}
