import React from 'react'
import { formatUnits } from '@ethersproject/units'
import { useTranslation } from 'react-i18next'
import { Tooltip, CountUp } from '@pooltogether/react-components'

import { useUsersAddress } from '@hooks/useUsersAddress'
import { useUsersTicketDelegateAllPools } from '@hooks/v4/PrizePool/useUsersTicketDelegateAllPools'
import { useUsersTotalTwab } from '@hooks/v4/PrizePool/useUsersTotalTwab'

export const BalanceDelegatedTo = () => {
  const usersAddress = useUsersAddress()
  const { t } = useTranslation()

  const { data: twabs, isFetched: isTwabsFetched } = useUsersTotalTwab(usersAddress)

  let usersTotalV4TwabBalance = Number(twabs?.twab.amount)
  let delegatedToAmount = null

  const queryResults = useUsersTicketDelegateAllPools()

  const isFetched = isTwabsFetched && queryResults.every((queryResult) => queryResult.isFetched)

  if (isFetched) {
    queryResults.forEach((queryResult) => {
      const result = queryResult.data
      const delegatedToSelf = result?.[usersAddress].toLowerCase() === usersAddress.toLowerCase()

      if (delegatedToSelf) {
        const amountToSubtract = Number(
          formatUnits(result?.ticketData.ticket, result?.ticketDecimals)
        )
        usersTotalV4TwabBalance = usersTotalV4TwabBalance - amountToSubtract
      }
    })

    delegatedToAmount = usersTotalV4TwabBalance
  }

  if (!delegatedToAmount || delegatedToAmount === '0.0') {
    return null
  }

  return (
    <>
      <li>
        <hr />
      </li>

      <li className='transition bg-white bg-opacity-70 hover:bg-opacity-100 dark:bg-actually-black dark:bg-opacity-10 dark:hover:bg-opacity-20 rounded-lg '>
        <button className='p-4 w-full flex justify-between items-center'>
          <span className='flex w-full items-center font-semibold text-sm xs:text-lg'>
            <span className='mr-2'>{'🎁 '}</span>
            {t('totalDelegatedToYou', 'Total delegated to you')}
            <span className='ml-1'>
              <Tooltip
                id={`tooltip-total-delegated-to-you`}
                tip={t(
                  'delegationDescription',
                  'Other people can delegate their chances of winning to you. This is typically used for winners of competitions or for charity.'
                )}
                iconClassName='opacity-50 relative hover:opacity-100 transition'
              />
            </span>
          </span>

          <span className='leading-none font-bold text-sm xs:text-lg mr-3'>
            $<CountUp countTo={delegatedToAmount} />
          </span>
        </button>
      </li>
    </>
  )
}
