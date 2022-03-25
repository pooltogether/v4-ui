import React from 'react'
import Link from 'next/link'
import { useTranslation } from 'react-i18next'
import { constants } from 'ethers'

import { useAllUsersTicketDelegates } from '@hooks/v4/PrizePool/useAllUsersTicketDelegates'
import { useUsersAddress } from '@hooks/useUsersAddress'
import { useAllUsersV4Balances } from '@hooks/v4/PrizePool/useAllUsersV4Balances'

export const AlertBanners = () => {
  return <DelegateTicketsBanner />
}

const DelegateTicketsBanner = () => {
  const { t } = useTranslation()

  const usersAddress = useUsersAddress()
  const queriesResult = useAllUsersTicketDelegates(usersAddress)
  const { data, isFetched } = useAllUsersV4Balances(usersAddress)

  const booleanResults = queriesResult.map(
    ({ isFetched: isTicketDelegateFetched, data: ticketDelegateData }) => {
      if (!isFetched || !isTicketDelegateFetched) return false

      const balances = data.balances.find((balance) => {
        return balance.prizePool.id() === ticketDelegateData.prizePool.id()
      })

      const notDelegated = ticketDelegateData.ticketDelegate === constants.AddressZero
      const hasTicketBalance = balances.balances.ticket.hasBalance
      return notDelegated && hasTicketBalance
    }
  )

  const showWarning = booleanResults.some((booleanResult) => booleanResult)

  if (!showWarning) {
    return null
  }

  return (
    <div className='w-full p-4 z-40 text-center bg-secondary text-white'>
      {t('toWinPrizesNeedToActivate')}
      <br />
      <Link href='/account#deposits'>
        <a className='font-semibold text-highlight-3 underline'>
          {t('activateOnTheAccountPage', 'Activate on the account page')}
        </a>
      </Link>
    </div>
  )
}
