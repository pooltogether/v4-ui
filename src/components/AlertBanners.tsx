import React, { useState } from 'react'
import Link from 'next/link'
import classNames from 'classnames'
import { useTranslation } from 'react-i18next'
import { PrizePool } from '@pooltogether/v4-client-js'
import { SquareButtonSize } from '@pooltogether/react-components'
import { useTransaction } from '@pooltogether/hooks'
import { constants } from 'ethers'

import { InfoList } from '@components/InfoList'
import { TxButtonNetworkGated } from '@components/Input/TxButtonNetworkGated'
import { TxReceiptItem } from '@components/InfoList/TxReceiptItem'
import { useUser } from '@hooks/v4/User/useUser'
import { useUsersTicketDelegateAllPools } from '@hooks/v4/PrizePool/useUsersTicketDelegateAllPools'
import { useSendTransaction } from '@hooks/useSendTransaction'
import { useUsersAddress } from '@hooks/useUsersAddress'
import { getNetworkNiceNameByChainId } from '@pooltogether/utilities'

export const AlertBanners = () => {
  return <DelegateTicketsBanner />
}

const DelegateTicketsBanner = () => {
  const { t } = useTranslation()

  const usersAddress = useUsersAddress()
  const queriesResult = useUsersTicketDelegateAllPools()

  const booleanResults = queriesResult.map((queryResult) => {
    const result = queryResult.data
    const notDelegated = result?.[usersAddress] === constants.AddressZero
    const hasTicketBalance = result?.ticketData.ticket.gt(0)
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
