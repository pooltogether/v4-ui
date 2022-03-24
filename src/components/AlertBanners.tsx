import React from 'react'
import Link from 'next/link'
import { useTranslation } from 'react-i18next'
import { constants } from 'ethers'

import { useUsersTicketDelegateAllPools } from '@hooks/v4/PrizePool/useUsersTicketDelegateAllPools'
import { useUsersAddress } from '@hooks/useUsersAddress'

export const AlertBanners = () => {
  return <DelegateTicketsBanner />
}

const DelegateTicketsBanner = () => {
  const { t } = useTranslation()

  const queriesResult = useUsersTicketDelegateAllPools()

  const booleanResults = queriesResult.map((queryResult) => {
    const result = queryResult.data
    const notDelegated = result?.delegate === constants.AddressZero
    const hasTicketBalance = result?.prizePoolBalances?.ticket.gt(0)
    return notDelegated && hasTicketBalance
  })

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
