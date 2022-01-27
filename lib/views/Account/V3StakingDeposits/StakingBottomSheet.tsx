import { useTokenAllowance, useTransaction } from '.yalc/@pooltogether/hooks/dist'
import { useOnboard } from '@pooltogether/bnc-onboard-hooks'
import { BigNumber } from 'ethers'
import { useState } from 'react'
import { useTranslation } from 'react-i18next'
import { BalanceBottomSheet, ContractLink, SquareButtonTheme } from '@pooltogether/react-components'

import { useIsWalletMetamask } from 'lib/hooks/useIsWalletMetamask'
import { useIsWalletOnNetwork } from 'lib/hooks/useIsWalletOnNetwork'
import { useUsersAddress } from 'lib/hooks/useUsersAddress'
import { V3PrizePoolBalances } from 'lib/hooks/v3/useAllUsersV3Balances'
import { buildApproveTx } from 'lib/transactions/buildApproveTx'
import { PrizePoolDepositView } from '../V3Deposits/PrizePoolDepositView'
import { PrizePoolWithdrawView } from '../V3Deposits/PrizePoolWithdrawView'
import { TokenFaucetClaimView } from '../V3Deposits/TokenFaucetClaimView'
import { V3_PRIZE_POOL_ADDRESSES } from 'lib/constants/v3'
import { useUsersTokenFaucetRewards } from 'lib/hooks/v3/useUsersTokenFaucetRewards'
import { useTokenFaucetData } from 'lib/hooks/v3/useTokenFaucetData'

interface StakingBalanceBottomSheetProps {
  chainId: number
  balances: V3PrizePoolBalances
  isOpen: boolean
  underlyingTokenValueUsd: number
  setIsOpen: (x: boolean) => void
  refetch: () => void
}

export const StakingBottomSheet = (props: StakingBalanceBottomSheetProps) => {
  const { balances, chainId, underlyingTokenValueUsd, isOpen, setIsOpen, refetch } = props

  const { t } = useTranslation()

  const prizePool = balances.prizePool
  const { provider } = useOnboard()
  const isWalletMetaMask = useIsWalletMetamask()
  const isWalletOnProperNetwork = useIsWalletOnNetwork(chainId)

  const [depositTxId, setDepositTxId] = useState(0)
  const depositTx = useTransaction(depositTxId)

  const [approveTxId, setApproveTxId] = useState(0)
  const approveTx = useTransaction(approveTxId)

  const [claimTxId, setClaimTxId] = useState(0)
  const claimTx = useTransaction(claimTxId)

  const [withdrawTxId, setWithdrawTxId] = useState(0)
  const withdrawTx = useTransaction(withdrawTxId)

  const { token, ticket } = balances

  const closeInitialSheet = () => setIsOpen(false)

  const usersAddress = useUsersAddress()
  const {
    data: depositAllowanceUnformatted,
    isFetched: isTokenAllowanceFetched,
    refetch: refetchDepositAllowance
  } = useTokenAllowance(
    chainId,
    usersAddress,
    prizePool.addresses.prizePool,
    prizePool.addresses.token
  )

  const tokenFaucetAddress = getTokenFaucetAddressTokenFaucetAddress(
    chainId,
    prizePool.addresses.prizePool
  )

  // TODO: Could just funnel this through props
  const { data: tokenFaucetData, isFetched: isTokenFaucetDataFetched } = useTokenFaucetData(
    chainId,
    tokenFaucetAddress,
    prizePool,
    underlyingTokenValueUsd
  )
  const { data: tokenFaucetRewards, isFetched: isTokenFaucetRewardsFetched } =
    useUsersTokenFaucetRewards(
      chainId,
      usersAddress,
      prizePool,
      tokenFaucetAddress,
      underlyingTokenValueUsd
    )

  const revokeAllowanceCallTransaction = buildApproveTx(
    provider,
    BigNumber.from(0),
    prizePool.addresses.prizePool,
    balances.token
  )

  const onDismiss = () => setIsOpen(false)

  const depositView = (
    <PrizePoolDepositView
      chainId={chainId}
      prizePool={prizePool}
      token={token}
      ticket={ticket}
      depositAllowanceUnformatted={depositAllowanceUnformatted}
      isTokenAllowanceFetched={isTokenAllowanceFetched}
      closeInitialSheet={closeInitialSheet}
      setExternalDepositTxId={setDepositTxId}
      setExternalApproveTxId={setApproveTxId}
      refetch={() => {
        refetchDepositAllowance()
        refetch()
      }}
    />
  )

  // TODO: Dynamically build claiming views & triggers based on the list of token faucets stored in constants
  const claimView = (
    <TokenFaucetClaimView
      chainId={chainId}
      tokenFaucetAddress={tokenFaucetAddress}
      tokenFaucetRewards={tokenFaucetRewards}
      vapr={tokenFaucetData?.vapr}
      isTokenFaucetDataFetched={isTokenFaucetDataFetched}
      closeInitialSheet={closeInitialSheet}
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
      theme: SquareButtonTheme.teal
    },
    {
      id: 'claim',
      view: () => claimView,
      label: t('rewards'),
      theme: SquareButtonTheme.rainbow
    },
    {
      id: 'withdraw',
      view: () => withdrawView,
      disabled: ticket.amountUnformatted.isZero(),
      label: t('withdraw'),
      theme: SquareButtonTheme.tealOutline
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
      tx={withdrawTx || depositTx || claimTx || approveTx}
      className='space-y-4'
      isWalletOnProperNetwork={isWalletOnProperNetwork}
      isWalletMetaMask={isWalletMetaMask}
      chainId={chainId}
      token={token}
      balance={token}
      balanceUsd={token.balanceUsd}
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
