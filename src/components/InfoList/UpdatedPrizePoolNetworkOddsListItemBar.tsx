import { EstimateAction } from '@constants/odds'
import { useUsersPrizePoolNetworkOdds } from '@hooks/v4/PrizePoolNetwork/useUsersPrizePoolNetworkOdds'
import { Amount } from '@pooltogether/hooks'
import { PrizePool } from '@pooltogether/v4-client-js'
import { useUsersAddress } from '@pooltogether/wallet-connection'
import classNames from 'classnames'
import React, { useMemo } from 'react'
import { useTranslation } from 'next-i18next'

import { getOddsWidth } from './UpdatedPrizePoolOddsListItemBar'

export const UpdatedPrizePoolNetworkOddsListItemBar = (props: {
  prizePool: PrizePool
  amount: Amount
  action: EstimateAction
  className?: string
}) => {
  const { amount, action, className, prizePool } = props
  const { t } = useTranslation()

  const usersAddress = useUsersAddress()
  const { data: oddsData } = useUsersPrizePoolNetworkOdds(usersAddress, {
    [prizePool?.id()]: {
      action,
      actionAmountUnformatted: amount?.amountUnformatted
    }
  })

  let odds = oddsData?.odds || 0
  const width = useMemo(() => getOddsWidth(odds), [odds])

  return (
    <li
      className={classNames(
        className,
        'w-full rounded-full bg-white h-2 bg-opacity-10 overflow-hidden my-2'
      )}
    >
      <div className='bg-pt-teal rounded-full h-full' style={{ width: `${width}%` }} />
    </li>
  )
}
