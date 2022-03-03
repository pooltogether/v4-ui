import React, { useState } from 'react'
import Link from 'next/link'
import classNames from 'classnames'
import { ethers } from 'ethers'
import { useTranslation } from 'react-i18next'
import { PrizePool } from '@pooltogether/v4-client-js'
import { SquareButtonSize } from '@pooltogether/react-components'
import { TokenBalance, useTransaction } from '@pooltogether/hooks'

import { InfoList } from '@components/InfoList'
import { TxButtonNetworkGated } from '@components/Input/TxButtonNetworkGated'
import { TxReceiptItem } from '@components/InfoList/TxReceiptItem'
import { useUser } from '@hooks/v4/User/useUser'
import { useUsersV4Balances } from '@hooks/v4/PrizePool/useUsersV4Balances'
import { useUsersTicketDelegate } from '@hooks/v4/PrizePool/useUsersTicketDelegate'
import { useSendTransaction } from '@hooks/useSendTransaction'
import { useUsersAddress } from '@hooks/useUsersAddress'
import { getNetworkNiceNameByChainId } from '@pooltogether/utilities'

export const AlertBanners = () => {
  return <DelegateTicketsBanner />
}

const DelegateTicketsBanner = () => {
  const { t } = useTranslation()
  const usersAddress = useUsersAddress()

  const { data, isFetched: usersV4BalancesIsFetched } = useUsersV4Balances(usersAddress)

  if (!usersV4BalancesIsFetched) {
    return null
  }
  console.log(data)
  // const queriesResult = useAllPrizePoolTokens()
  // const isAllPrizePoolTokensFetched = queriesResult.every((queryResult) => queryResult.isFetched)

  // const queryResults = useQueries(
  //   prizePools.map((prizePool) => {
  //     return {
  //       queryKey: [USERS_PRIZE_POOL_BALANCES_QUERY_KEY, prizePool.id(), usersAddress],
  //       queryFn: async () => {
  //         const queryResult = queriesResult?.find((queryResult) => {
  //           const { data: tokens } = queryResult
  //           return tokens.prizePoolId === prizePool.id()
  //         })
  //         const { data: tokens } = queryResult
  //         return getUsersPrizePoolBalances(prizePool, usersAddress, tokens)
  //       },
  //       enabled: isAllPrizePoolTokensFetched
  //     }
  //   })
  // )

  const showWarning = data.balances.map(
    (balances) => console.log(balances)
    // balances.prizePool
    // balances.prizePool.id()
  )

  // const {
  //   data: delegateData,
  //   isFetched: usersTicketDelegateIsFetched,
  //   refetch: refetchDelegate
  // } = useUsersTicketDelegate(usersAddress, prizePool)

  // if (
  //   !balance ||
  //   balance.amountUnformatted.isZero() ||
  //   !usersTicketDelegateIsFetched ||
  //   delegateData?.[usersAddress] !== ethers.constants.AddressZero
  // ) {
  //   return null
  // }

  return (
    <div className='w-full p-4 z-40 text-center bg-secondary text-white'>
      {/* <div className='inline-block w-48 font-normal text-black'>usersTotalV4TwabBalance:</div>{' '} */}

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

interface ActivateTicketsButtonProps {
  prizePool: PrizePool
  refetchDelegate: () => void
  className?: string
}

const ActivateTicketsButton = (props: ActivateTicketsButtonProps) => {
  const { className, refetchDelegate, prizePool } = props
  const sendTx = useSendTransaction()
  const [txId, setTxId] = useState(0)
  const tx = useTransaction(txId)

  const { t } = useTranslation()

  const user = useUser(prizePool)

  const sendDelegateTx = async (e) => {
    e.preventDefault()

    const txId = await sendTx({
      name: `Activate deposits`,
      method: 'withdrawInstantlyFrom',
      callTransaction: () => user.selfDelegateTickets(),
      callbacks: {
        refetch: () => {
          refetchDelegate()
        }
      }
    })
    setTxId(txId)
  }

  if (tx?.inFlight || (tx?.completed && !tx?.error && !tx?.cancelled)) {
    return (
      <InfoList>
        <TxReceiptItem depositTx={tx} chainId={prizePool.chainId} />
      </InfoList>
    )
  }

  return (
    <TxButtonNetworkGated
      chainId={prizePool.chainId}
      toolTipId={`activate-deposits-${prizePool?.id()}`}
      className={classNames('', className)}
      size={SquareButtonSize.sm}
      onClick={sendDelegateTx}
    >
      {t('activateNetworkDeposit', { network: getNetworkNiceNameByChainId(prizePool.chainId) })}
    </TxButtonNetworkGated>
  )
}
