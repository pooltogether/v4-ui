import React, { useMemo, useState } from 'react'
import FeatherIcon from 'feather-icons-react'
import { ethers, BigNumber } from 'ethers'
import { MaxUint256 } from '@ethersproject/constants'
import { FieldValues, UseFormReturn } from 'react-hook-form'
import { useOnboard } from '@pooltogether/bnc-onboard-hooks'
import { useTranslation } from 'react-i18next'
import { useForm } from 'react-hook-form'
import { TransactionResponse } from '@ethersproject/abstract-provider'
import { Trans } from 'react-i18next'

import {
  // snapTo90,
  SquareButton,
  BalanceBottomSheet,
  ContractLink,
  NetworkIcon,
  TokenIcon,
  ThemedClipSpinner,
  SquareButtonTheme
} from '@pooltogether/react-components'
import {
  getNetworkNiceNameByChainId,
  calculateAPR,
  calculateLPTokenPrice,
  amountMultByUsd,
  toScaledUsdBigNumber,
  numberWithCommas,
  NETWORK
} from '@pooltogether/utilities'
import {
  useTransaction,
  useStakingPoolChainData,
  useUserLPChainData,
  useStakingPools,
  useTokenBalances,
  useCoingeckoTokenPrices,
  usePoolTokenData,
  TokenWithBalance,
  Transaction,
  Token,
  UserLPChainData,
  Amount
} from '@pooltogether/hooks'
import { formatUnits } from 'ethers/lib/utils'

import TokenFaucetAbi from 'abis/TokenFaucet'
import PrizePoolAbi from 'abis/PrizePool'
import Erc20Abi from 'abis/ERC20Abi'

import { POOL_ADDRESS } from 'lib/constants/constants'
import { VAPRTooltip } from 'lib/components/VAPRTooltip'
import { GenericDepositAmountInput } from 'lib/components/Input/GenericDepositAmountInput'
import { ModalTitle } from 'lib/components/Modal/ModalTitle'
import { ModalTransactionSubmitted } from 'lib/components/Modal/ModalTransactionSubmitted'
import { useUsersAddress } from 'lib/hooks/useUsersAddress'
import { DepositAllowance } from 'lib/hooks/v4/PrizePool/useUsersDepositAllowance'
import { UsersPrizePoolBalances } from 'lib/hooks/v4/PrizePool/useUsersPrizePoolBalances'
import { useSelectedChainId } from 'lib/hooks/useSelectedChainId'
import { useIsWalletMetamask } from 'lib/hooks/useIsWalletMetamask'
import { useIsWalletOnNetwork } from 'lib/hooks/useIsWalletOnNetwork'
import { BottomButton, DepositInfoBox } from 'lib/views/Deposit/DepositForm'
import { DepositConfirmationModal } from 'lib/views/Deposit/DepositConfirmationModal'
import { getAmountFromString } from 'lib/utils/getAmountFromString'
import { useSendTransaction } from 'lib/hooks/useSendTransaction'

export const DEPOSIT_QUANTITY_KEY = 'amountToDeposit'

export interface StakingPoolTokens {
  ticket: Token
  underlyingToken: UnderlyingToken
  tokenFaucetDripToken: Token
}

export interface StakingPool {
  prizePool: { chainId: number; address: string }
  tokens: StakingPoolTokens
  tokenFaucet: { address: string }
}

export interface UnderlyingToken {
  balance: string
  balanceUnformatted: BigNumber
  allowance: BigNumber
}

export const StakingDeposits = () => {
  const { t } = useTranslation()

  return (
    <div id='staking'>
      <h4 className='mb-2'>{t('poolToken', 'POOL Token')}</h4>

      <PoolTokenBalance />

      <StakingDepositsList />
    </div>
  )
}

const PoolTokenBalance = () => {
  const { t } = useTranslation()
  const usersAddress = useUsersAddress()

  const { data: tokenData, isFetched } = usePoolTokenData(usersAddress, usersAddress)

  const { usersBalance } = tokenData || {}
  const balanceFormatted = usersBalance ? numberWithCommas(usersBalance) : '0.00'

  return (
    <div className='relative bg-pt-purple-lightest dark:bg-opacity-40 dark:bg-pt-purple rounded-lg p-4 mb-4'>
      <div className='flex items-center justify-between font-semibold text-lg'>
        {t('yourPool', 'Your POOL Balance')}
        <span>
          <TokenIcon chainId={NETWORK.mainnet} address={POOL_ADDRESS} className='mr-2 my-auto' />
          <span className='font-bold'>
            {!isFetched || !usersBalance ? (
              <ThemedClipSpinner sizeClassName='w-4 h-4' />
            ) : (
              balanceFormatted
            )}
          </span>
        </span>
      </div>
    </div>
  )
}

const StakingDepositsList = () => {
  const stakingPools = useStakingPools()

  return stakingPools.map((stakingPool) => {
    const { prizePool } = stakingPool

    return (
      <StakingDepositItem
        key={`staking-pool-${prizePool.chainId}-${prizePool.address}`}
        chainId={prizePool.chainId}
        stakingPool={stakingPool}
      />
    )
  })
}

const useLpPriceData = (chainId, stakingPoolChainData, stakingPool) => {
  const { tokenFaucetData, underlyingTokenData, ticketsData } = stakingPoolChainData || {}
  const { dripRatePerDayUnformatted } = tokenFaucetData || {}
  const { tokens } = stakingPool || {}
  const { underlyingToken, tokenFaucetDripToken } = tokens || {}

  const { token1, token2 } = underlyingToken

  const { data: tokenPrices, isFetched: tokenPricesIsFetched } = useCoingeckoTokenPrices(chainId, [
    token1.address,
    token2.address,
    tokenFaucetDripToken.address
  ])

  const { data: lPTokenBalances, isFetched: tokenBalancesIsFetched } = useTokenBalances(
    chainId,
    underlyingToken.address,
    [token1.address, token2.address]
  )

  const dripTokenUsd = tokenPrices?.[tokenFaucetDripToken.address.toLowerCase()]?.usd || 0

  const lpTokenPrice = useLpTokenPrice(
    lPTokenBalances,
    tokenPrices,
    tokenPricesIsFetched,
    tokenBalancesIsFetched,
    underlyingToken,
    underlyingTokenData
  )

  const apr = useStakingAPR(
    lpTokenPrice,
    underlyingTokenData,
    dripTokenUsd,
    dripRatePerDayUnformatted,
    ticketsData
  )

  return { apr, lpTokenPrice, tokenPrices }
}

interface StakingDepositItemProps {
  chainId: number
  stakingPool: StakingPool
}

const StakingDepositItem = (props: StakingDepositItemProps) => {
  const { stakingPool } = props

  const usersAddress = useUsersAddress()

  const { t } = useTranslation()

  const [isOpen, setIsOpen] = useState(false)

  const { setSelectedChainId } = useSelectedChainId()

  const {
    data: stakingPoolChainData,
    refetch: stakingPoolChainDataRefetch,
    isFetched: stakingPoolChainDataIsFetched
  } = useStakingPoolChainData(stakingPool)
  const {
    data: userLPChainData,
    refetch: userLPChainDataRefetch,
    isFetched: userLPChainDataIsFetched
  } = useUserLPChainData(stakingPool, stakingPoolChainData, usersAddress)

  const isFetched = userLPChainDataIsFetched && stakingPoolChainDataIsFetched

  const refetch = () => {
    console.log('running refetch user lp chain data, staking pool chain data')
    stakingPoolChainDataRefetch()
    userLPChainDataRefetch()
  }

  if (!isFetched) {
    return <LoadingList />
  }

  const balances = userLPChainData.balances

  const accountPageView = balances.ticket.hasBalance ? (
    <>
      <StakingBalanceStats
        {...props}
        t={t}
        balances={balances}
        userLPChainData={userLPChainData}
        stakingPoolChainData={stakingPoolChainData}
      />

      <ManageDepositButton
        {...props}
        setIsOpen={setIsOpen}
        setSelectedChainId={setSelectedChainId}
      />
    </>
  ) : (
    <BlankStateView
      {...props}
      stakingPoolChainData={stakingPoolChainData}
      setIsOpen={setIsOpen}
      setSelectedChainId={setSelectedChainId}
    />
  )

  return (
    <div
      className='relative rounded-lg p-4 text-white'
      style={{
        backgroundImage: 'linear-gradient(300deg, #eC2BB8 0%, #EA69D6 100%)'
      }}
    >
      <div
        className='absolute r-4 t-3 w-6 h-6 text-xl'
        style={{ textShadow: '2px 2px 0px rgba(50, 10, 100, 0.3)' }}
      >
        💎
      </div>

      <StakingBlockTitle {...props} t={t} />

      {accountPageView}

      <StakingBalanceBottomSheet
        {...props}
        isOpen={isOpen}
        userLPChainData={userLPChainData}
        isFetched={isFetched}
        stakingPoolChainData={stakingPoolChainData}
        refetch={refetch}
        setIsOpen={setIsOpen}
      />
    </div>
  )
}

interface StakingBalanceBottomSheetProps {
  chainId: number
  stakingPool: StakingPool
  isOpen: boolean
  isFetched: boolean
  userLPChainData: UserLPChainData
  setIsOpen: Function
  stakingPoolChainData: object
  refetch: () => void
}

const StakingBalanceBottomSheet = (props: StakingBalanceBottomSheetProps) => {
  const {
    chainId,
    stakingPool,
    setIsOpen,
    isFetched,
    isOpen,
    stakingPoolChainData,
    userLPChainData,
    refetch
  } = props

  const { t } = useTranslation()

  const { tokens } = stakingPool || {}
  const { underlyingToken, tokenFaucetDripToken } = tokens || {}

  const { provider } = useOnboard()
  const isWalletMetaMask = useIsWalletMetamask()
  const isWalletOnProperNetwork = useIsWalletOnNetwork(chainId)

  // const [withdrawTxId, setWithdrawTxId] = useState(0)
  // const withdrawTx = useTransaction(withdrawTxId)

  const [depositTxId, setDepositTxId] = useState(0)
  const depositTx = useTransaction(depositTxId)

  const [approveTxId, setApproveTxId] = useState(0)
  const approveTx = useTransaction(approveTxId)

  const [claimTxId, setClaimTxId] = useState(0)
  const claimTx = useTransaction(claimTxId)

  const balances = userLPChainData.balances
  const tokenBalance = balances.token
  const ticketBalance = balances.ticket

  const depositAllowance: DepositAllowance = getDepositAllowance(userLPChainData)

  const revokeAllowanceCallTransaction = buildApproveTx({
    provider,
    amount: BigNumber.from(0),
    prizePoolAddress: stakingPool.prizePool.address,
    token: balances.token
  })

  const { lpTokenPrice } = useLpPriceData(chainId, stakingPoolChainData, stakingPool)

  const depositView = (
    <DepositView
      {...props}
      underlyingToken={underlyingToken}
      userLPChainData={userLPChainData}
      ticketBalance={ticketBalance}
      tokenBalance={tokenBalance}
      tokenBalanceIsFetched={isFetched}
      depositTx={depositTx}
      approveTx={approveTx}
      refetch={refetch}
      closeInitialSheet={() => setIsOpen(false)}
      setDepositTxId={setDepositTxId}
      setApproveTxId={setApproveTxId}
    />
  )

  const claimView = (
    <ClaimView
      {...props}
      claimTx={claimTx}
      userLPChainData={userLPChainData}
      tokenFaucetDripToken={tokenFaucetDripToken}
      stakingPoolChainData={stakingPoolChainData}
      closeInitialSheet={() => setIsOpen(false)}
      setClaimTxId={setClaimTxId}
      refetch={refetch}
    />
  )

  const withdrawView = (
    <>
      <ModalTitle
        chainId={chainId}
        title={`${t('withdraw')}: ${tokenBalance.symbol}`}
        className='mb-4'
      />
    </>
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
    }
    // {
    //   id: 'withdraw',
    //   view: () => withdrawView,
    //   label: t('withdraw'),
    //   theme: SquareButtonTheme.tealOutline
    // }
  ]

  const contractLinks: ContractLink[] = [
    {
      i18nKey: 'prizePool',
      chainId,
      address: stakingPool.prizePool.address
    },
    {
      i18nKey: 'depositToken',
      chainId,
      address: stakingPool.tokens.underlyingToken.address
    },
    {
      i18nKey: 'ticketToken',
      chainId,
      address: stakingPool.tokens.ticket.address
    }
  ]

  const balanceUsd = getAmountFromString(
    (Number(ticketBalance.amount) * lpTokenPrice?.toNumber()).toString(),
    '18'
  )

  return (
    <BalanceBottomSheet
      {...props}
      t={t}
      views={views}
      title={`${t('manage')}: ${underlyingToken.symbol}`}
      // snapPoints={snapTo90}
      contractLinks={contractLinks}
      balance={getAmountFromString(ticketBalance.amount, '18')}
      balanceUsd={balanceUsd}
      token={getToken(ticketBalance)}
      open={isOpen}
      onDismiss={() => setIsOpen(false)}
      tx={null}
      className='space-y-4'
      isWalletOnProperNetwork={isWalletOnProperNetwork}
      isWalletMetaMask={isWalletMetaMask}
      revokeAllowanceCallTransaction={revokeAllowanceCallTransaction}
      useSendTransaction={useSendTransaction}
      depositAllowance={depositAllowance}
    />
  )
}

const useLpTokenPrice = (
  lPTokenBalances,
  tokenPrices,
  tokenPricesIsFetched,
  tokenBalancesIsFetched,
  underlyingToken,
  underlyingTokenData
) => {
  const { token1, token2 } = underlyingToken

  if (
    !tokenPricesIsFetched ||
    !tokenBalancesIsFetched ||
    !underlyingTokenData ||
    !underlyingTokenData.totalSupply
  ) {
    return null
  }

  return calculateLPTokenPrice(
    formatUnits(
      lPTokenBalances[token1.address].amountUnformatted,
      lPTokenBalances[token1.address].decimals
    ),
    formatUnits(
      lPTokenBalances[token2.address].amountUnformatted,
      lPTokenBalances[token2.address].decimals
    ),
    tokenPrices[token1.address.toLowerCase()]?.usd || 0,
    tokenPrices[token2.address.toLowerCase()]?.usd || 0,
    underlyingTokenData.totalSupply
  )
}

const useStakingAPR = (
  lpTokenPrice,

  underlyingTokenData,
  dripTokenUsd,
  dripRatePerDayUnformatted,
  ticketsData
) => {
  if (!lpTokenPrice) {
    return null
  }

  const totalDailyValueUnformatted = amountMultByUsd(dripRatePerDayUnformatted, dripTokenUsd)

  const totalDailyValue = formatUnits(totalDailyValueUnformatted, underlyingTokenData.decimals)
  const totalDailyValueScaled = toScaledUsdBigNumber(totalDailyValue)

  const totalValueUnformatted = amountMultByUsd(
    ticketsData.totalSupplyUnformatted,
    lpTokenPrice.toNumber()
  )

  const totalValue = formatUnits(totalValueUnformatted, underlyingTokenData.decimals)
  const totalValueScaled = toScaledUsdBigNumber(totalValue)

  return calculateAPR(totalDailyValueScaled, totalValueScaled)
}

const BlankStateView = (props) => {
  const { setSelectedChainId, chainId, setIsOpen, stakingPool, stakingPoolChainData } = props
  const { tokenFaucetDripToken } = stakingPool.tokens

  const { apr } = useLpPriceData(chainId, stakingPoolChainData, stakingPool)

  const { t } = useTranslation()

  return (
    <>
      <p className='text-sm'>
        {t('lpDepositDescription', 'Deposit Uniswap V2 POOL-ETH LP tokens to earn extra POOL!')}
      </p>
      <h5 className='mt-3'>
        <span
          className='relative -mt-2 inline-block mr-1'
          style={{
            top: -2
          }}
        >
          <TokenIcon
            chainId={chainId}
            address={tokenFaucetDripToken.address}
            sizeClassName='w-6 h-6'
          />
        </span>{' '}
        <Trans
          i18nKey='earnPercentageVAPR'
          defaults='Earn {{percentage}}% <tooltip>vAPR</tooltip>'
          values={{ percentage: apr }}
          components={{
            tooltip: <VAPRTooltip t={t} />
          }}
        />
      </h5>
      <div className='flex items-end justify-end w-full mt-4'>
        <button
          className='flex items-center transition uppercase font-semibold text-lg opacity-90 hover:opacity-100 rounded-lg bg-pt-purple-darker bg-opacity-20 hover:bg-opacity-10 pl-4'
          onClick={() => {
            setSelectedChainId(chainId)
            setIsOpen(true)
          }}
        >
          {t('deposit')}{' '}
          <FeatherIcon
            icon='chevron-right'
            className='transition w-6 h-6 opacity-50 hover:opacity-100 my-auto ml-1'
          />
        </button>
      </div>
    </>
  )
}

const StakingBalanceStats = (props) => {
  const { t } = props

  return (
    <div className='rounded-lg bg-pt-purple-darker bg-opacity-20 px-8 py-6'>
      <ul className='space-y-4'>
        <li className='flex items-center justify-between font-semibold text-lg'>
          {t('deposited', 'Deposited')}{' '}
          <StakingDepositBalance {...props} balances={props.balances} />
        </li>
        <li className='flex items-center justify-between font-semibold text-lg'>
          {t('rewards', 'Rewards')} <StakingRewardsBalance {...props} balances={props.balances} />
        </li>
        <li className='flex items-center justify-between font-semibold text-lg'>
          {t('earning', 'Earning')} <StakingEarningBalance {...props} balances={props.balances} />
        </li>
      </ul>
    </div>
  )
}

const ManageDepositButton = (props) => {
  const { stakingPool, setIsOpen, setSelectedChainId } = props
  const { prizePool } = stakingPool

  const { t } = useTranslation()

  return (
    <div className='flex items-end justify-end w-full mt-4'>
      <button
        className='flex items-center transition uppercase font-semibold text-lg opacity-90 hover:opacity-100 rounded-lg bg-pt-purple-darker bg-opacity-20 hover:bg-opacity-10 pl-4'
        onClick={() => {
          setSelectedChainId(prizePool.chainId)
          setIsOpen(true)
        }}
      >
        {t('manage')}{' '}
        <FeatherIcon
          icon='chevron-right'
          className='transition w-6 h-6 opacity-50 hover:opacity-100 my-auto ml-1'
        />
      </button>
    </div>
  )
}

const NetworkLabel = (props: { chainId: number }) => (
  <div className='flex'>
    <NetworkIcon chainId={props.chainId} className='mr-2 my-auto' />
    <span className='font-bold xs:text-lg'>{getNetworkNiceNameByChainId(props.chainId)}</span>
  </div>
)

interface StakingDepositStatProps {
  chainId: number
  stakingPool: StakingPool
  stakingPoolChainData: object
  balances: UsersPrizePoolBalances
  userLPChainData: UserLPChainData
  apr: string
}

const StakingDepositBalance = (props: StakingDepositStatProps) => {
  const { balances, stakingPool } = props

  if (!balances) {
    return null
  }

  const { ticket } = balances
  return (
    <div className='flex'>
      <TokenIcon
        chainId={stakingPool.prizePool.chainId}
        address={ticket.address}
        className='mr-2 my-auto'
      />
      <span className='font-bold text-lg mr-3'>
        {ticket.amountPretty} {ticket.symbol}
      </span>
    </div>
  )
}

const StakingRewardsBalance = (props: StakingDepositStatProps) => {
  const { balances, stakingPool, userLPChainData } = props

  if (!balances) {
    return null
  }

  const { tokenFaucetDripToken } = stakingPool.tokens

  const { userData } = userLPChainData
  const amount = userData.claimableBalance

  return (
    <div className='flex'>
      <TokenIcon
        chainId={stakingPool.prizePool.chainId}
        address={tokenFaucetDripToken.address}
        className='mr-2 my-auto'
      />
      <span className='font-bold text-lg mr-3'>
        {numberWithCommas(amount)} {tokenFaucetDripToken.symbol}
      </span>
    </div>
  )
}

const StakingEarningBalance = (props: StakingDepositStatProps) => {
  const { balances, chainId, stakingPool, stakingPoolChainData } = props

  const { t } = useTranslation()

  const { apr } = useLpPriceData(chainId, stakingPoolChainData, stakingPool)

  if (!balances) {
    return null
  }

  const { tokenFaucetDripToken } = stakingPool.tokens

  return (
    <div className='flex'>
      <TokenIcon
        chainId={stakingPool.prizePool.chainId}
        address={tokenFaucetDripToken.address}
        className='mr-2 my-auto'
      />
      <span className='font-bold text-lg mr-3'>
        {apr}% <VAPRTooltip t={t} />
      </span>
    </div>
  )
}

const StakingBlockTitle = (props) => {
  const { t, chainId, stakingPool } = props

  const { pair, symbol } = stakingPool.tokens.underlyingToken
  const { tokenFaucetDripToken } = stakingPool.tokens
  const { address } = tokenFaucetDripToken

  return (
    <div className='font-semibold text-xl mb-4'>
      <span
        className='relative -mt-2 inline-block'
        style={{
          top: -2
        }}
      >
        <NetworkIcon sizeClassName='w-6 h-6' chainId={chainId} />
      </span>
      <span
        className='relative -ml-2 -mt-1 inline-block'
        style={{
          top: -2
        }}
      >
        <TokenIcon chainId={chainId} address={address} className='mr-1' sizeClassName='w-6 h-6' />
      </span>
      {t('stake')} {pair} {symbol}
    </div>
  )
}

export interface UnderlyingToken {
  balance: string
  balanceUnformatted: BigNumber
  allowance: BigNumber
}

export interface DepositViewProps {
  chainId: number
  tokenBalanceIsFetched: Boolean
  tokenBalance: TokenWithBalance
  ticketBalance: TokenWithBalance
  stakingPool: StakingPool
  userLPChainData: UserLPChainData
  depositTx: Transaction
  approveTx: Transaction
  underlyingToken: UnderlyingToken
  closeInitialSheet: () => void
  setDepositTxId: (number) => void
  setApproveTxId: (number) => void
  refetch: () => void
}

export enum DepositViews {
  'depositForm',
  'review'
}

const DepositView = (props: DepositViewProps) => {
  const { tokenBalance, userLPChainData } = props

  const [depositView, setDepositView] = useState(DepositViews.depositForm)

  const form = useForm({
    mode: 'onChange',
    reValidateMode: 'onChange'
  })
  const { watch } = form

  const setDepositFormView = () => {
    setDepositView(DepositViews.depositForm)
  }

  const setReviewDepositView = () => {
    setDepositView(DepositViews.review)
  }

  const quantity = watch(DEPOSIT_QUANTITY_KEY)
  const amountToDeposit = useMemo(
    () => getAmountFromString(quantity, tokenBalance?.decimals),
    [quantity, tokenBalance?.decimals]
  )

  const depositAllowance: DepositAllowance = getDepositAllowance(userLPChainData, amountToDeposit)

  switch (depositView) {
    case DepositViews.depositForm:
      return (
        <DepositFormView
          {...props}
          form={form}
          depositAllowance={depositAllowance}
          amountToDeposit={amountToDeposit}
          setReviewDepositView={setReviewDepositView}
        />
      )
    case DepositViews.review:
      return (
        <DepositReviewView
          {...props}
          depositAllowance={depositAllowance}
          amountToDeposit={amountToDeposit}
          setDepositFormView={setDepositFormView}
        />
      )
  }
}

export interface DepositFormViewProps extends DepositViewProps {
  form: UseFormReturn<FieldValues, object>
  amountToDeposit: Amount
  depositAllowance: DepositAllowance
  setReviewDepositView: () => void
}

const DepositFormView = (props: DepositFormViewProps) => {
  const {
    amountToDeposit,
    chainId,
    form,
    depositTx,
    tokenBalance,
    ticketBalance,
    setReviewDepositView
  } = props

  const { t } = useTranslation()

  const { isWalletConnected } = useOnboard()

  const {
    handleSubmit,
    formState: { isValid, isDirty, errors }
  } = form

  return (
    <>
      <ModalTitle
        chainId={chainId}
        title={`${t('deposit')}: ${tokenBalance.symbol}`}
        className='mb-4'
      />

      <form onSubmit={handleSubmit(setReviewDepositView)} className='w-full'>
        <div className='w-full mx-auto'>
          <GenericDepositAmountInput
            {...props}
            depositTokenClassName='w-96'
            chainId={chainId}
            className=''
            form={form}
            tokenBalance={tokenBalance}
            ticketBalance={ticketBalance}
            inputKey={DEPOSIT_QUANTITY_KEY}
          />
        </div>

        <DepositInfoBox
          {...props}
          className='mt-3'
          chainId={chainId}
          depositTx={depositTx}
          errors={isDirty ? errors : null}
        />

        <BottomButton
          {...props}
          className='mt-4 w-full'
          disabled={(!isValid && isDirty) || depositTx?.inFlight}
          depositTx={depositTx}
          isWalletConnected={isWalletConnected}
          tokenBalance={tokenBalance}
          token={getToken(tokenBalance)}
          amountToDeposit={amountToDeposit}
        />
      </form>
    </>
  )
}

const getToken = (tokenBalance) => {
  const token: Token = {
    address: tokenBalance.address,
    decimals: tokenBalance.decimals,
    name: tokenBalance.name,
    symbol: tokenBalance.symbol
  }

  return token
}

const getTicket = (ticketBalance) => {
  const ticket: Token = {
    address: ticketBalance.address,
    decimals: ticketBalance.decimals,
    name: ticketBalance.name,
    symbol: ticketBalance.symbol
  }

  return ticket
}

export interface DepositReviewViewProps extends DepositViewProps {
  amountToDeposit: Amount
  depositAllowance: DepositAllowance
  setDepositFormView: () => void
}

const DepositReviewView = (props: DepositReviewViewProps) => {
  const {
    chainId,
    amountToDeposit,
    stakingPool,
    depositAllowance,
    ticketBalance,
    tokenBalance,
    userLPChainData,
    closeInitialSheet,
    setDepositTxId,
    setApproveTxId,
    setDepositFormView,
    refetch
  } = props

  const { t } = useTranslation()
  const { provider } = useOnboard()
  const sendTx = useSendTransaction()
  const [isOpen, setIsOpen] = useState(true)
  const usersAddress = useUsersAddress()

  const balances = userLPChainData.balances

  const token = getToken(tokenBalance)

  const showConfirmModal = isOpen

  const closeDepositModal = () => {
    setDepositFormView()
    setIsOpen(false)
  }

  const onSuccess = (tx: Transaction) => {
    setDepositTxId(0)
    closeDepositModal()
    closeInitialSheet()
  }

  const sendApproveTx = async () => {
    const callTransaction = buildApproveTx({
      provider,
      amount: MaxUint256,
      prizePoolAddress: stakingPool.prizePool.address,
      token: tokenBalance
    })

    const name = t(`allowTickerPool`, { ticker: token.symbol })
    const txId = await sendTx({
      name,
      method: 'approve',
      callTransaction,
      callbacks: {
        refetch
      }
    })
    setApproveTxId(txId)
  }

  const sendDepositTx = async () => {
    const name = `${t('deposit')} ${amountToDeposit.amountPretty} ${token.symbol}`
    // const overrides: Overrides = { gasLimit: 750000 }

    const callTransaction = buildDepositTx({
      provider,
      amount: amountToDeposit.amountUnformatted,
      prizePoolAddress: stakingPool.prizePool.address,
      ticket: balances.ticket,
      usersAddress
    })

    const txId = await sendTx({
      name,
      method: 'depositTo',
      callTransaction,
      callbacks: {
        onSuccess,
        refetch
      }
    })
    setDepositTxId(txId)
  }

  return (
    <DepositConfirmationModal
      {...props}
      chainId={chainId}
      isOpen={showConfirmModal}
      label='deposit confirmation modal'
      isDataFetched={true}
      amountToDeposit={amountToDeposit}
      depositAllowance={depositAllowance}
      resetState={() => {}}
      token={getToken(tokenBalance)}
      ticket={getTicket(ticketBalance)}
      closeModal={closeDepositModal}
      sendApproveTx={sendApproveTx}
      sendDepositTx={sendDepositTx}
    />
  )
}

export interface ClaimViewProps {
  tokenFaucetDripToken: Token
  chainId: number
  stakingPoolChainData: object
  stakingPool: StakingPool
  userLPChainData: UserLPChainData
  claimTx: Transaction
  closeInitialSheet: () => void
  setClaimTxId: (number) => void
  refetch: () => void
}

export enum ClaimViews {
  'main',
  'claiming'
}

const ClaimView = (props: ClaimViewProps) => {
  const { chainId, stakingPoolChainData, stakingPool, claimTx } = props

  if (claimTx && claimTx.sent) {
    return <ClaimClaimingView {...props} />
  }

  const { apr, tokenPrices } = useLpPriceData(chainId, stakingPoolChainData, stakingPool)

  return <ClaimMainView {...props} apr={apr} tokenPrices={tokenPrices} />
}

export interface ClaimMainViewProps extends ClaimViewProps {
  apr: string
  tokenPrices: object
  refetch: () => void
}

const ClaimMainView = (props: ClaimMainViewProps) => {
  const {
    tokenPrices,
    userLPChainData,
    stakingPool,
    tokenFaucetDripToken,
    chainId,
    apr,
    setClaimTxId,
    refetch
  } = props

  const { t } = useTranslation()
  const { provider } = useOnboard()
  const sendTx = useSendTransaction()
  const usersAddress = useUsersAddress()

  const tokenFaucet = stakingPool.tokenFaucet
  const tokenFaucetAddress = tokenFaucet.address

  const { userData } = userLPChainData

  const onSuccess = (tx: Transaction) => {
    setClaimTxId(0)
  }

  const sendClaimTx = async () => {
    const callTransaction = buildClaimTx({
      provider,
      tokenFaucetAddress,
      usersAddress
    })

    const name = t(`claimAmountTicker`, 'Claim {{amount}} {{ticker}}', {
      amount: numberWithCommas(userData.claimableBalance),
      ticker: tokenFaucetDripToken.symbol
    })
    const txId = await sendTx({
      name,
      method: 'claim',
      callTransaction,
      callbacks: {
        onSuccess,
        refetch
      }
    })
    setClaimTxId(txId)
  }

  const dripTokenUsd = tokenPrices[tokenFaucetDripToken.address.toLowerCase()]?.usd || 0

  return (
    <>
      <ModalTitle
        chainId={chainId}
        title={`${t('claim')}: ${tokenFaucetDripToken.symbol}`}
        className='mb-4'
      />

      <h5 className='pt-4 text-center'>
        {t('unclaimedRewards', 'Unclaimed rewards')}{' '}
        <span className='opacity-50 font-normal'>
          {' '}
          ${numberWithCommas(Number(userData.claimableBalance) * dripTokenUsd)}
        </span>
      </h5>

      <div className='bg-white dark:bg-actually-black dark:bg-opacity-10 rounded-xl w-full py-6 flex flex-col mb-4'>
        <span className={'text-3xl mx-auto font-bold leading-none'}>
          {numberWithCommas(userData.claimableBalance)}
        </span>
        <span className='mx-auto flex mt-1'>
          <TokenIcon
            chainId={chainId}
            address={tokenFaucetDripToken.address}
            sizeClassName='w-6 h-6'
          />
          <span className='ml-2 opacity-50'>{tokenFaucetDripToken.symbol}</span>
        </span>
      </div>

      <div
        className='relative rounded-lg p-4 text-white mt-2 mb-4 text-center font-semibold'
        style={{
          backgroundImage: 'linear-gradient(300deg, #eC2BB8 0%, #EA69D6 100%)'
        }}
      >
        <Trans
          i18nKey='earningPercentageVAPR'
          defaults='Earning {{percentage}}% <tooltip>vAPR</tooltip>'
          values={{ percentage: apr }}
          components={{
            tooltip: <VAPRTooltip t={t} />
          }}
        />
      </div>

      <div className='mt-6'>
        <SquareButton
          disabled={!userData.claimableBalanceUnformatted.gt(0)}
          onClick={sendClaimTx}
          className='flex w-full items-center justify-center'
          theme={SquareButtonTheme.rainbow}
        >
          {t('claim', 'Claim')}
        </SquareButton>
      </div>
    </>
  )
}

export interface ClaimClaimingViewProps extends ClaimViewProps {}

const ClaimClaimingView = (props: ClaimClaimingViewProps) => {
  const { chainId, closeInitialSheet, claimTx } = props
  const { t } = useTranslation()

  return (
    <>
      <ModalTitle chainId={chainId} title={t('claimSubmitted', 'Claim submitted')} />
      <ModalTransactionSubmitted
        className='mt-8'
        chainId={chainId}
        tx={claimTx}
        closeModal={closeInitialSheet}
      />
    </>
  )
}

const LoadingList = () => (
  <ul className='space-y-4'>
    <li className='rounded-lg bg-white bg-opacity-20 dark:bg-actually-black dark:bg-opacity-10 animate-pulse w-full h-10' />
    <li className='rounded-lg bg-white bg-opacity-20 dark:bg-actually-black dark:bg-opacity-10 animate-pulse w-full h-10' />
  </ul>
)

const getDepositAllowance = (userLPChainData: UserLPChainData, amountToDeposit?: Amount) => {
  const { userData } = userLPChainData
  const { underlyingToken } = userData

  let isApproved = false

  // When depositing we want to check if they have a certain amount they want to deposit
  // When revoking allowance we just want to make sure their allowance is more than 0
  if (amountToDeposit?.amountUnformatted) {
    isApproved = underlyingToken.allowance.gt(amountToDeposit.amountUnformatted)
  } else {
    isApproved = underlyingToken.allowance.gt(0)
  }

  const depositAllowance: DepositAllowance = {
    isApproved,
    allowanceUnformatted: underlyingToken.allowance
  }

  return depositAllowance
}

export interface BuildApproveTxArgs {
  amount: BigNumber
  prizePoolAddress: string
  provider: ethers.providers.Web3Provider
  token: Token
}

const buildApproveTx = (args: BuildApproveTxArgs) => {
  const { amount, token, prizePoolAddress, provider } = args

  const signer = provider.getSigner()

  const params = [prizePoolAddress, amount]

  const contract = new ethers.Contract(token.address, Erc20Abi, signer)

  const contractCall: () => Promise<TransactionResponse> = contract['approve'].bind(null, ...params)

  return contractCall
}

export interface BuildDepositTxArgs {
  amount: BigNumber
  provider: ethers.providers.Web3Provider
  ticket: Token
  prizePoolAddress: string
  usersAddress: string
}

const buildDepositTx = (args: BuildDepositTxArgs) => {
  const { amount, usersAddress, ticket, prizePoolAddress, provider } = args

  const signer = provider.getSigner()

  const params = [usersAddress, amount, ticket.address, ethers.constants.AddressZero]

  const contract = new ethers.Contract(prizePoolAddress, PrizePoolAbi, signer)

  const contractCall: () => Promise<TransactionResponse> = contract['depositTo'].bind(
    null,
    ...params
  )

  return contractCall
}

export interface BuildClaimTxArgs {
  provider: ethers.providers.Web3Provider
  tokenFaucetAddress: string
  usersAddress: string
}

const buildClaimTx = (args: BuildClaimTxArgs) => {
  const { tokenFaucetAddress, usersAddress, provider } = args

  const signer = provider.getSigner()

  const params = [usersAddress]
  //           disabled={claimableBalanceUnformatted.isZero()}

  const contract = new ethers.Contract(tokenFaucetAddress, TokenFaucetAbi, signer)

  const contractCall: () => Promise<TransactionResponse> = contract['claim'].bind(null, ...params)

  return contractCall
}
