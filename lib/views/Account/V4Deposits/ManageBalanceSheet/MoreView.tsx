import React, { useState } from 'react'
import FeatherIcon from 'feather-icons-react'
import { PrizePool } from '@pooltogether/v4-js-client'
import { TransactionResponse } from '@ethersproject/abstract-provider'
import {
  addTokenToMetamask,
  BlockExplorerLink,
  LinkToContractItem,
  poolToast,
  SquareButton
} from '@pooltogether/react-components'
import { useTranslation } from 'react-i18next'
import { getNetworkNiceNameByChainId } from '@pooltogether/utilities'
import { Token, useTransaction } from '@pooltogether/hooks'

import { BackButton, ManageSheetViews } from '.'
import { DepositAllowance } from 'lib/hooks/Tsunami/PrizePool/useUsersDepositAllowance'
import { ModalTitle } from 'lib/components/Modal/ModalTitle'
import { useIsWalletOnNetwork } from 'lib/hooks/useIsWalletOnNetwork'
import { useIsWalletMetamask } from 'lib/hooks/useIsWalletMetamask'
import { RevokeAllowanceButton } from 'lib/views/RevokeAllowanceButton'
import { UsersPrizePoolBalances } from 'lib/hooks/Tsunami/PrizePool/useUsersPrizePoolBalances'
import { useSendTransaction } from 'lib/hooks/useSendTransaction'
import { useUsersDepositAllowance } from 'lib/hooks/Tsunami/PrizePool/useUsersDepositAllowance'
import { useSelectedChainIdUser } from 'lib/hooks/Tsunami/User/useSelectedChainIdUser'

const TOKEN_IMG_URL = {
  PTaUSDC: 'https://app.pooltogether.com/ptausdc@2x.png'
}

interface MoreViewProps {
  chainId: number
  prizePool: PrizePool
  balances: UsersPrizePoolBalances
  setView: Function
  isFetched: Boolean
  depositAllowance: DepositAllowance
  callTransaction: () => Promise<TransactionResponse>
  refetch: () => {}
}

export const MoreView = (props: MoreViewProps) => {
  const { prizePool, balances, setView } = props
  const { t } = useTranslation()
  const { ticket, token } = balances

  const isMetaMask = useIsWalletMetamask()
  const isWalletOnProperNetwork = useIsWalletOnNetwork(prizePool.chainId)

  const handleAddTokenToMetaMask = async () => {
    if (!ticket) {
      return
    }

    if (!isWalletOnProperNetwork) {
      poolToast.warn(
        t('switchToNetworkToAddToken', `Switch to {{networkName}} to add token '{{token}}'`, {
          networkName: getNetworkNiceNameByChainId(prizePool.chainId),
          token: token.symbol
        })
      )
      return null
    }

    addTokenToMetamask(
      ticket.symbol,
      ticket.address,
      Number(ticket.decimals),
      TOKEN_IMG_URL[ticket.symbol]
    )
  }

  return (
    <>
      <ModalTitle
        chainId={prizePool.chainId}
        title={t('depositsOnNetwork', { network: getNetworkNiceNameByChainId(prizePool.chainId) })}
      />
      <ul className='bg-white bg-opacity-20 dark:bg-actually-black dark:bg-opacity-10 rounded-xl w-full p-4 flex flex-col space-y-1'>
        <div className='opacity-50 font-bold flex justify-between'>
          <span>{t('contract', 'Contract')}</span>
          <span>{t('explorer', 'Explorer')}</span>
        </div>
        <LinkToContractItem
          i18nKey='prizePool'
          chainId={prizePool.chainId}
          address={prizePool.address}
        />
        <LinkToContractItem
          i18nKey='ticketToken'
          chainId={prizePool.chainId}
          address={ticket.address}
        />
        <LinkToContractItem
          i18nKey='depositToken'
          chainId={prizePool.chainId}
          address={token.address}
        />
      </ul>
      {isMetaMask && (
        <SquareButton
          onClick={handleAddTokenToMetaMask}
          className='flex w-full items-center justify-center'
        >
          <FeatherIcon icon='plus-circle' className='w-5 mr-1' />{' '}
          {t('addTicketTokenToMetamask', {
            token: ticket?.symbol
          })}
        </SquareButton>
      )}

      <RevokeAllowanceButton
        {...props}
        isWalletOnProperNetwork={isWalletOnProperNetwork}
        chainId={prizePool.chainId}
        token={token}
      />

      <BackButton onClick={() => setView(ManageSheetViews.main)} />
    </>
  )
}
