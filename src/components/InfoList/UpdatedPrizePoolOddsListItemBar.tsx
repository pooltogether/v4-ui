import { EstimateAction } from '@constants/odds'
import { useUsersPrizePoolOdds } from '@hooks/v4/PrizePool/useUsersPrizePoolOdds'
import { Amount } from '@pooltogether/hooks'
import { PrizePool } from '@pooltogether/v4-client-js'
import { useUsersAddress } from '@pooltogether/wallet-connection'
import classNames from 'classnames'
import React, { useMemo } from 'react'

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
        'rounded-full w-full bg-white h-2 bg-opacity-10 overflow-hidden my-2'
      )}
    >
      <div
        className={classNames('h-full odds--progress-bar rounded-l-full', {
          'bg-gradient-purple': width < 20 && width > 0,
          'bg-blue': width < 30 && width > 20,
          'bg-pt-teal': width < 40 && width > 30,
          'bg-orange': width < 47 && width > 40,
          'bg-pink': width < 55 && width > 47,
          'seamless-gradient-wrapper': width > 55
        })}
        style={{ width: `${width}%` }}
      />
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
