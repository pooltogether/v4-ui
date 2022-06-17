import { Amount } from '@pooltogether/hooks'
import React from 'react'
import { useTranslation } from 'react-i18next'

import { EstimateAction } from '@hooks/v4/PrizePoolNetwork/usePrizePoolNetworkEstimatedOddsForAmount'
import { InfoListItem } from '.'
import { useUsersPrizePoolNetworkOdds } from '@hooks/v4/PrizePoolNetwork/useUsersPrizePoolNetworkOdds'
import { useUsersAddress } from '@pooltogether/wallet-connection'

export const UpdatedPrizePoolNetworkOddsListItem = (props: {
  amount: Amount
  action: EstimateAction
}) => {
  const { amount, action } = props
  const { t } = useTranslation()

  const usersAddress = useUsersAddress()
  const oddsData = useUsersPrizePoolNetworkOdds(usersAddress, action, amount?.amountUnformatted)

  const isFetched = !!oddsData

  let value
  if (isFetched) {
    if (oddsData?.odds === 0) {
      value = <span className='opacity-80'>{t('none')}</span>
    } else {
      value = t('oneInOdds', { odds: oddsData.oneOverOdds.toFixed(2) })
    }
  }

  return (
    <InfoListItem
      label={'Updated Prize Pool Network winning odds'}
      labelToolTip={'Your estimated odds of winning at least one prize across the whole network'}
      loading={!isFetched}
      value={value}
    />
  )
}
