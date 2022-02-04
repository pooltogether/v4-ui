import { Amount } from '@pooltogether/hooks'
import { ThemedClipSpinner, Tooltip } from '@pooltogether/react-components'
import { PrizePool } from '@pooltogether/v4-js-client'
import React from 'react'
import { useTranslation } from 'react-i18next'

import { EstimateAction } from 'lib/hooks/v4/useEstimatedOddsForAmount'
import { InfoListItem } from './InfoList'
import { useUsersUpcomingOddsOfWinningAPrizeOnAnyNetwork } from 'lib/hooks/v4/useUsersUpcomingOddsOfWinningAPrizeOnAnyNetwork'
import { useUsersAddress } from 'lib/hooks/useUsersAddress'

export const UpdatedOdds = (props: {
  amount: Amount
  prizePool: PrizePool
  action: EstimateAction
}) => {
  const { amount, prizePool, action } = props
  const { t } = useTranslation()

  return (
    <InfoListItem
      label={t('updatedWinningOdds', 'Updated winning odds')}
      labelToolTip={t('oddsToWinOnePrize', 'Your estimated odds of winning at least one prize')}
      value={<UsersOddsValue amount={amount} action={action} />}
    />
  )
}

export const UsersOddsValue = (props: {
  emptyString?: string
  action?: EstimateAction
  amount?: Amount
}) => {
  const { t } = useTranslation()
  const { amount, action, emptyString } = props
  const usersAddress = useUsersAddress()

  const oddsData = useUsersUpcomingOddsOfWinningAPrizeOnAnyNetwork(
    usersAddress,
    action,
    amount?.amountUnformatted
  )

  if (!Boolean(oddsData)) {
    return <ThemedClipSpinner sizeClassName='w-3 h-3' />
  } else if (oddsData.odds === 0) {
    return <span className='opacity-80'>{emptyString || t('none')}</span>
  }
  return <>{t('oneInOdds', { odds: oddsData.oneOverOdds.toFixed(2) })}</>
}

UsersOddsValue.defaultProps = {
  action: EstimateAction.none
}
