import { Amount } from '@pooltogether/hooks'
import React, { useMemo } from 'react'

import { EstimateAction } from '@constants/odds'
import { useUsersAddress } from '@pooltogether/wallet-connection'
import { useUsersPrizePoolOdds } from '@hooks/v4/PrizePool/useUsersPrizePoolOdds'
import { PrizePool } from '@pooltogether/v4-client-js'
import classNames from 'classnames'

export const UpdatedPrizePoolOddsListItemBar: React.FC<{
  prizePool: PrizePool
  amount: Amount
  action: EstimateAction
  className?: string
}> = (props) => {
  const { amount, action, className, prizePool } = props

  const usersAddress = useUsersAddress()
  const { data: oddsData } = useUsersPrizePoolOdds(
    usersAddress,
    prizePool,
    action,
    amount?.amountUnformatted
  )

  let odds = oddsData?.odds || 0
  const width = useMemo(() => getOddsWidth(odds), [odds])

  return (
    <li
      className={classNames(
        className,
        'w-full rounded-full bg-white h-2 bg-opacity-10 overflow-hidden'
      )}
    >
      <div className='bg-pt-teal rounded-full h-full' style={{ width: `${width}%` }} />
    </li>
  )
}

/**
 * Simple formula to get a nicer curve for the bar to fill with
 * ~50% full is $5000 which is a
 * @param odds
 * @returns
 */
export const getOddsWidth = (odds: number) => {
  const width = Math.pow(odds, 1 / 5) * 100
  return width
}
