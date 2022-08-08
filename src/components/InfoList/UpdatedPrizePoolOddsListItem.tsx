import { Amount } from '@pooltogether/hooks'
import React from 'react'
import { useTranslation } from 'react-i18next'

import { EstimateAction } from '@constants/odds'
import { InfoListItem } from '.'
import { useUsersAddress } from '@pooltogether/wallet-connection'
import { useUsersPrizePoolOdds } from '@hooks/v4/PrizePool/useUsersPrizePoolOdds'
import { PrizePool } from '@pooltogether/v4-client-js'

export const UpdatedPrizePoolOddsListItem: React.FC<{
  prizePool: PrizePool
  amount: Amount
  action: EstimateAction
  nullState?: React.ReactNode
  className?: string
  labelClassName?: string
  valueClassName?: string
}> = (props) => {
  const { amount, action, className, nullState, prizePool, labelClassName, valueClassName } = props
  const { t } = useTranslation()

  const usersAddress = useUsersAddress()
  const { data: oddsData } = useUsersPrizePoolOdds(
    usersAddress,
    prizePool,
    action,
    amount?.amountUnformatted
  )

  const isFetched = !!oddsData

  let value
  if (isFetched) {
    if (oddsData?.odds === 0) {
      if (nullState) {
        value = <span className='opacity-80'>{nullState}</span>
      } else {
        value = <span className='opacity-80'>{t('none')}</span>
      }
    } else {
      value = t('oneInOdds', { odds: oddsData.oneOverOdds.toFixed(2) })
    }
  }

  return (
    <InfoListItem
      className={className}
      label={'Prize Pool winning odds'}
      labelToolTip={'Your estimated odds of winning at least one prize in this prize pool'}
      loading={!isFetched}
      value={value}
      labelClassName={labelClassName}
      valueClassName={valueClassName}
    />
  )
}
