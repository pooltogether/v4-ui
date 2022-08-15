import React from 'react'
import { useTranslation } from 'react-i18next'
import { InfoListItem } from '.'
import { numberWithCommas } from '@pooltogether/utilities'

import { useAllChainsFilteredPromotions } from '@hooks/v4/TwabRewards/useAllChainsFilteredPromotions'
import { useSelectedPrizePool } from '@hooks/v4/PrizePool/useSelectedPrizePool'
import { usePromotionVAPR } from '@hooks/v4/TwabRewards/usePromotionVAPR'

/**
 *
 * @param props
 * @returns
 */
export const TwabRewardsAprItem: React.FC<{
  labelClassName?: string
  valueClassName?: string
}> = (props) => {
  const { labelClassName, valueClassName } = props

  const { t } = useTranslation()

  const prizePool = useSelectedPrizePool()

  const promotionsQueryResults = useAllChainsFilteredPromotions()
  const isFetched = promotionsQueryResults.every((queryResult) => queryResult.isFetched)

  const chainPromotions = promotionsQueryResults?.find(
    (result) => result.data?.chainId === prizePool.chainId
  )?.data?.promotions

  const atLeastOnePromotionActive = chainPromotions?.some((promotion) => !promotion.isComplete)

  const value = <PromotionsVAPRSum promotions={chainPromotions} />

  if (!atLeastOnePromotionActive) {
    return null
  }

  return (
    <InfoListItem
      labelClassName={labelClassName}
      valueClassName={valueClassName}
      label={t('rewardsVapr', 'Rewards vAPR')}
      labelToolTip={t(
        'rewardsVaprDescription',
        'Rewards vAPR is the variable annual rate of return on your deposit in the form of rewards, based on the total value of deposits on this chain'
      )}
      loading={!isFetched}
      labelLink='https://docs.pooltogether.com/welcome/faq#what-is-the-prize-apr'
      value={value}
    />
  )
}

const PromotionsVAPRSum = (props) => {
  const { promotions } = props

  const promotionsVaprs = promotions.reduce((accumulator, promotion) => {
    const vapr = usePromotionVAPR(promotion)
    return accumulator + vapr
  }, 0)

  return <>{numberWithCommas(promotionsVaprs)}%</>
}

TwabRewardsAprItem.defaultProps = {
  labelClassName: '',
  valueClassName: ''
}
