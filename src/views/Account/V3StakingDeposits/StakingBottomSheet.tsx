import { useState } from 'react'
import { useTranslation } from 'react-i18next'
import { BalanceBottomSheet, ContractLink, ButtonTheme } from '@pooltogether/react-components'
import { useIsWalletOnChainId, useTransaction } from '@pooltogether/wallet-connection'

import { useIsWalletMetamask } from '@hooks/useIsWalletMetamask'
import { V3PrizePoolBalances } from '@hooks/v3/useAllUsersV3Balances'
import { PrizePoolDepositView } from '../V3Deposits/PrizePoolDepositView'
import { PrizePoolWithdrawView } from '../V3Deposits/PrizePoolWithdrawView'
import { TokenFaucetClaimView } from '../V3Deposits/TokenFaucetClaimView'
import { V3_PRIZE_POOL_ADDRESSES } from '@constants/v3'

interface StakingBalanceBottomSheetProps {
  chainId: number
  balances: V3PrizePoolBalances
  isOpen: boolean
  setIsOpen: (x: boolean) => void
  refetch: () => void
}

export const StakingBottomSheet = (props: StakingBalanceBottomSheetProps) => {
  const { balances, chainId, isOpen, setIsOpen, refetch } = props

  const { t } = useTranslation()

  const prizePool = balances.prizePool
  const isWalletMetaMask = useIsWalletMetamask()
  const isWalletOnProperNetwork = useIsWalletOnChainId(chainId)

  const [depositTxId, setDepositTxId] = useState('')
  const depositTx = useTransaction(depositTxId)

  const [approveTxId, setApproveTxId] = useState('')
  const approveTx = useTransaction(approveTxId)

  const [claimTxId, setClaimTxId] = useState('')
  const claimTx = useTransaction(claimTxId)

  const [withdrawTxId, setWithdrawTxId] = useState('')
  const withdrawTx = useTransaction(withdrawTxId)

  const { token, ticket } = balances

  const tokenFaucetAddress = getTokenFaucetAddressTokenFaucetAddress(
    chainId,
    prizePool.addresses.prizePool
  )

  const onDismiss = () => setIsOpen(false)

  const depositView = (
    <PrizePoolDepositView
      chainId={chainId}
      prizePool={prizePool}
      onDismiss={() => setIsOpen(false)}
      setExternalDepositTxId={setDepositTxId}
      setExternalApproveTxId={setApproveTxId}
      refetch={refetch}
    />
  )

  // TODO: Dynamically build claiming views & triggers based on the list of token faucets stored in constants
  const claimView = (
    <TokenFaucetClaimView
      chainId={chainId}
      tokenFaucetAddress={tokenFaucetAddress}
      prizePool={prizePool}
      underlyingToken={token}
      onDismiss={() => setIsOpen(false)}
      setExternalClaimTxId={setClaimTxId}
      refetch={refetch}
    />
  )

  const withdrawView = (
    <PrizePoolWithdrawView
      setWithdrawTxId={setWithdrawTxId}
      onDismiss={onDismiss}
      refetchBalances={refetch}
      chainId={chainId}
      ticket={ticket}
      token={token}
      prizePool={prizePool}
    />
  )

  const views = [
    {
      id: 'deposit',
      view: () => depositView,
      label: t('deposit'),
      theme: ButtonTheme.teal
    },
    {
      id: 'claim',
      view: () => claimView,
      label: t('rewards'),
      theme: ButtonTheme.rainbow
    },
    {
      id: 'withdraw',
      view: () => withdrawView,
      disabled: ticket.amountUnformatted.isZero(),
      label: t('withdraw'),
      theme: ButtonTheme.tealOutline
    }
  ]

  const contractLinks: ContractLink[] = [
    {
      i18nKey: 'prizePool',
      chainId,
      address: prizePool.addresses.prizePool
    },
    {
      i18nKey: 'depositToken',
      chainId,
      address: prizePool.addresses.token
    },
    {
      i18nKey: 'ticketToken',
      chainId,
      address: prizePool.addresses.ticket
    },
    {
      i18nKey: 'tokenFaucet',
      chainId,
      address: tokenFaucetAddress
    }
  ]

  return (
    <BalanceBottomSheet
      t={t}
      views={views}
      title={`${t('manage')}: ${prizePool.tokens.token.symbol}`}
      contractLinks={contractLinks}
      open={isOpen}
      onDismiss={onDismiss}
      transactionHash={
        withdrawTx?.response?.hash ||
        depositTx?.response?.hash ||
        claimTx?.response?.hash ||
        approveTx?.response?.hash
      }
      className='space-y-4'
      isWalletOnProperNetwork={isWalletOnProperNetwork}
      isWalletMetaMask={isWalletMetaMask}
      chainId={chainId}
      ticket={ticket}
      token={token}
      balance={ticket}
      balanceUsd={ticket.balanceUsd}
    />
  )
}

/**
 * Temporary fn to pull the first token faucet address form constants for a prize pool
 * @param chainId
 * @param prizePoolAddress
 */
export const getTokenFaucetAddressTokenFaucetAddress = (
  chainId: number,
  prizePoolAddress: string
) => {
  const tokenFaucets = V3_PRIZE_POOL_ADDRESSES[chainId]?.find(
    (prizePool) => prizePool.prizePool === prizePoolAddress
  )?.tokenFaucets
  return tokenFaucets?.[0]
}
