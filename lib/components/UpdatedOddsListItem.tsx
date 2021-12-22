import { Amount } from '@pooltogether/hooks'
import { ThemedClipSpinner, Tooltip } from '@pooltogether/react-components'
import { PrizePool } from '@pooltogether/v4-js-client'
import React from 'react'
import { useTranslation } from 'react-i18next'

import { EstimateAction } from 'lib/hooks/Tsunami/useEstimatedOddsForAmount'
import { InfoListItem } from './InfoList'
import { useUsersUpcomingOddsOfWinningAPrizeOnAnyNetwork } from 'lib/hooks/Tsunami/useUsersUpcomingOddsOfWinningAPrizeOnAnyNetwork'
import { useUsersAddress } from 'lib/hooks/useUsersAddress'

export const UpdatedOdds = (props: {
  amount: Amount
  prizePool: PrizePool
  action: EstimateAction
}) => {
  const { amount, prizePool, action } = props
  const { t } = useTranslation()

  // If this is a V3 prize pool don't show odds
  if (!prizePool.contractMetadataList) {
    return null
  }

  return (
    <InfoListItem
      label={
        <Tooltip
          id={`tooltip-deposit-updated-odds`}
          tip={t('oddsToWinOnePrize', 'Your estimated odds of winning at least one prize')}
        >
          {t('updatedWinningOdds', 'Updated winning odds')}
        </Tooltip>
      }
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

  const data = useUsersUpcomingOddsOfWinningAPrizeOnAnyNetwork(
    usersAddress,
    action,
    amount?.amountUnformatted
  )
  const oddsData = data?.[usersAddress]

  if (!Boolean(data)) {
    return <ThemedClipSpinner sizeClassName='w-3 h-3' />
  } else if (oddsData.odds === 0) {
    return <span className='opacity-80'>{emptyString || t('none')}</span>
  }
  return <>{t('oneInOdds', { odds: oddsData.oneOverOdds.toFixed(2) })}</>
}

UsersOddsValue.defaultProps = {
  action: EstimateAction.none
}
