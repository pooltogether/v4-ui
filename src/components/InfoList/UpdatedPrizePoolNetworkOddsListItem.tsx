import { Amount } from '@pooltogether/hooks'
import React from 'react'
import { useTranslation } from 'react-i18next'

import { EstimateAction } from '@constants/odds'
import { InfoListItem } from '.'
import { useUsersPrizePoolNetworkOdds } from '@hooks/v4/PrizePoolNetwork/useUsersPrizePoolNetworkOdds'
import { useUsersAddress } from '@pooltogether/wallet-connection'
import { PrizePool } from '@pooltogether/v4-client-js'

export const UpdatedPrizePoolNetworkOddsListItem = (props: {
  prizePool: PrizePool
  amount: Amount
  action: EstimateAction
  nullState?: React.ReactNode
  className?: string
  labelClassName?: string
  valueClassName?: string
}) => {
  const { amount, action, nullState, className, prizePool, labelClassName, valueClassName } = props
  const { t } = useTranslation()

  const usersAddress = useUsersAddress()
  const { data: oddsData } = useUsersPrizePoolNetworkOdds(usersAddress, {
    [prizePool?.id()]: {
      action,
      actionAmountUnformatted: amount?.amountUnformatted
    }
  })

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
      label={'Prize Pool Network winning odds'}
      labelToolTip={'Your estimated odds of winning at least one prize across the whole network'}
      loading={!isFetched}
      value={value}
      className={className}
      labelClassName={labelClassName}
      valueClassName={valueClassName}
    />
  )
}
