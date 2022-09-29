import { useSelectedPrizePool } from '@hooks/v4/PrizePool/useSelectedPrizePool'
import { useAllChainsFilteredPromotions } from '@hooks/v4/TwabRewards/useAllChainsFilteredPromotions'
import { usePromotionVAPR } from '@hooks/v4/TwabRewards/usePromotionVAPR'
import { Promotion } from '@interfaces/promotions'
import { TokenIcon } from '@pooltogether/react-components'
import { numberWithCommas } from '@pooltogether/utilities'
import { useTranslation } from 'next-i18next'
import React from 'react'
import { InfoListItem } from '.'

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

  const value = (
    <ul className='flex flex-col space-y-1'>
      {chainPromotions?.map((promotion) => (
        <PromotionsVapr key={`promotion-${promotion.id}`} promotion={promotion} />
      ))}
    </ul>
  )

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

export const PromotionsVapr: React.FC<{ promotion: Promotion }> = (props) => {
  const { promotion } = props
  const vapr = usePromotionVAPR(promotion)

  if (vapr <= 0) return null

  return (
    <li className='flex space-x-2 items-center'>
      <span>{numberWithCommas(vapr)}% in</span>
      <TokenIcon chainId={promotion.chainId} address={promotion.token} sizeClassName='w-4 h-4' />
    </li>
  )
}

TwabRewardsAprItem.defaultProps = {
  labelClassName: '',
  valueClassName: ''
}
