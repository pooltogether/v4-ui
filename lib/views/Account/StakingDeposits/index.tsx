import React, { useMemo, useState } from 'react'
import classnames from 'classnames'
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
  snapTo90,
  addTokenToMetamask,
  SquareButton,
  DefaultBalanceSheetViews,
  BalanceBottomSheetPrizePool,
  BalanceBottomSheetBackButton,
  BalanceBottomSheetButtonTheme,
  BalanceBottomSheetTitle,
  BalanceBottomSheet,
  LinkToContractItem,
  NetworkIcon,
  TokenIcon,
  poolToast
} from '@pooltogether/react-components'
import {
  getNetworkNiceNameByChainId,
  calculateAPR,
  calculateLPTokenPrice,
  amountMultByUsd,
  toScaledUsdBigNumber,
  numberWithCommas,
  getMaxPrecision
} from '@pooltogether/utilities'
import {
  useTransaction,
  useStakingPoolChainData,
  useUserLPChainData,
  useStakingPools,
  useTokenBalances,
  useCoingeckoTokenPrices,
  TokenWithBalance,
  Transaction,
  Token,
  UserLPChainData,
  Amount
} from '@pooltogether/hooks'
import { formatUnits } from 'ethers/lib/utils'

import PrizePoolAbi from 'abis/PrizePool'
import Erc20Abi from 'abis/ERC20Abi'
import { VAPRTooltip } from 'lib/components/VAPRTooltip'
import { GenericDepositAmountInput } from 'lib/components/Input/GenericDepositAmountInput'
import { useUsersAddress } from 'lib/hooks/useUsersAddress'
import { DepositAllowance } from 'lib/hooks/Tsunami/PrizePool/useUsersDepositAllowance'
import { UsersPrizePoolBalances } from 'lib/hooks/Tsunami/PrizePool/useUsersPrizePoolBalances'
import { useSelectedChainId } from 'lib/hooks/useSelectedChainId'
import { useIsWalletMetamask } from 'lib/hooks/useIsWalletMetamask'
import { useIsWalletOnNetwork } from 'lib/hooks/useIsWalletOnNetwork'
import { BottomButton, DepositInfoBox } from 'lib/views/Deposit/DepositForm'
import { DepositConfirmationModal } from 'lib/views/Deposit/DepositConfirmationModal'
import { RevokeAllowanceButton } from 'lib/views/RevokeAllowanceButton'
import { getAmountFromString } from 'lib/utils/getAmountFromString'
import { useSendTransaction } from 'lib/hooks/useSendTransaction'

export const DEPOSIT_QUANTITY_KEY = 'amountToDeposit'

const TOKEN_IMG_URL = {
  PTaUSDC: 'https://app.pooltogether.com/ptausdc@2x.png'
}

export interface TokenFaucetDripToken {
  address: string
  symbol: string
}

export interface StakingPoolTokens {
  underlyingToken: UnderlyingToken
  tokenFaucetDripToken: TokenFaucetDripToken
}

export interface StakingPool {
  prizePool: { chainId: number; address: string }
  tokens: StakingPoolTokens
}

export const StakingDeposits = () => {
  const { t } = useTranslation()
  return (
    <div id='staking'>
      <h4 className='mb-2'>{t('poolToken', 'POOL Token')}</h4>

      <StakingDepositsList />
    </div>
  )
}

const StakingDepositsList = () => {
  const usersAddress = useUsersAddress()
  // const queryResults = useUsersStakingBalances(usersAddress)
  const stakingPools = useStakingPools()

  const { wallet, network } = useOnboard()

  // const user = useSelectedChainIdUser()
  // console.log({ user })

  // const { isTestnets } = useIsTestnets()
  // const chainId = isTestnets ? NETWORK.rinkeby : NETWORK.mainnet

  // const queryResults = useUsersV4Balances(usersAddress)
  // const isFetched = queryResults.every((queryResult) => queryResult.isFetched)

  // if (!isFetched) {
  //   return <LoadingList />
  // }

  return stakingPools.map((stakingPool) => {
    const { prizePool } = stakingPool

    return (
      <StakingDepositItem
        key={`staking-pool-${prizePool.chainId}-${prizePool.address}`}
        wallet={wallet}
        chainId={prizePool.chainId}
        network={network}
        stakingPool={stakingPool}
        prizePool={prizePool}
      />
    )
  })
}

interface StakingDepositItemProps {
  wallet: object
  network: number
  chainId: number
  stakingPool: StakingPool
  prizePool: BalanceBottomSheetPrizePool
}

const StakingDepositItem = (props: StakingDepositItemProps) => {
  const { prizePool, stakingPool, wallet, network } = props

  const usersAddress = useUsersAddress()

  const { t } = useTranslation()

  const [isOpen, setIsOpen] = useState(false)
  const [selectedView, setView] = useState(DefaultBalanceSheetViews.main)

  const { provider } = useOnboard()
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

  const [depositTxId, setDepositTxId] = useState(0)
  const depositTx = useTransaction(depositTxId)

  const [approveTxId, setApproveTxId] = useState(0)
  const approveTx = useTransaction(approveTxId)

  const [withdrawTxId, setWithdrawTxId] = useState(0)
  const withdrawTx = useTransaction(withdrawTxId)

  const { tokenFaucetData, underlyingTokenData, ticketsData } = stakingPoolChainData || {}
  const { dripRatePerDayUnformatted } = tokenFaucetData || {}
  const { tokens } = stakingPool || {}
  const { underlyingToken, tokenFaucetDripToken } = tokens || {}

  let balances, tokenBalance, ticketBalance
  let depositAllowance: DepositAllowance
  if (userLPChainData) {
    balances = userLPChainData.balances
    tokenBalance = balances.token
    ticketBalance = balances.ticket
    depositAllowance = getDepositAllowance(userLPChainData)
  }

  const apr = useStakingAPR(
    prizePool.chainId,
    underlyingToken,
    underlyingTokenData,
    tokenFaucetDripToken,
    dripRatePerDayUnformatted,
    ticketsData
  )

  if (!isFetched) {
    return <LoadingList />
  }

  const callTransaction = buildApproveTx({
    provider,
    amount: BigNumber.from(0),
    prizePool,
    token: balances.token
  })

  // const refetch = () => {
  //   stakingPoolChainDataRefetch()
  //   userLPChainDataRefetch()
  // }

  const depositView = (
    <DepositView
      {...props}
      userLPChainData={userLPChainData}
      ticketBalance={ticketBalance}
      tokenBalance={tokenBalance}
      tokenBalanceIsFetched={userLPChainDataIsFetched}
      depositTx={depositTx}
      approveTx={approveTx}
      setView={setView}
      userLPChainDataRefetch={userLPChainDataRefetch}
      closeInitialSheet={() => setIsOpen(false)}
      setDepositTxId={setDepositTxId}
      setApproveTxId={setApproveTxId}
    />
  )
  const withdrawView = <div>hi</div>
  const moreInfoView = (
    <MoreInfoView
      {...props}
      depositAllowance={depositAllowance}
      balances={balances}
      setView={setView}
      callTransaction={callTransaction}
      refetch={userLPChainDataRefetch}
      isFetched={userLPChainDataIsFetched}
    />
  )

  const buttons = [
    {
      theme: BalanceBottomSheetButtonTheme.primary,
      label: t('deposit'),
      onClick: () => setView(DefaultBalanceSheetViews.deposit)
    },
    {
      theme: BalanceBottomSheetButtonTheme.primary,
      label: t('claimRewards'),
      onClick: () => setView(DefaultBalanceSheetViews.deposit)
    },
    {
      theme: BalanceBottomSheetButtonTheme.secondary,
      label: t('withdraw'),
      disabled: !balances.ticket.hasBalance,
      onClick: () => setView(DefaultBalanceSheetViews.withdraw)
    },
    {
      theme: BalanceBottomSheetButtonTheme.tertiary,
      label: t('moreInfo'),
      onClick: () => setView(DefaultBalanceSheetViews.more)
    }
  ]

  const view = balances.ticket.hasBalance ? (
    <>
      <StakingBalanceStats
        {...props}
        apr={apr}
        t={t}
        balances={balances}
        userLPChainData={userLPChainData}
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
      setIsOpen={setIsOpen}
      setSelectedChainId={setSelectedChainId}
      apr={apr}
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

      {view}

      <BalanceBottomSheet
        {...props}
        t={t}
        snapPoints={snapTo90}
        balances={balances}
        prizePool={prizePool}
        open={isOpen}
        onDismiss={() => setIsOpen(false)}
        setView={setView}
        selectedView={selectedView}
        depositView={depositView}
        depositTx={depositTx}
        withdrawView={withdrawView}
        withdrawTx={withdrawTx}
        moreInfoView={moreInfoView}
        network={network}
        wallet={wallet}
        label={`Staking Balance sheet`}
        className='space-y-4'
        buttons={buttons}
      />
    </div>
  )
}

interface MoreInfoViewProps {
  chainId: number
  prizePool: BalanceBottomSheetPrizePool
  balances: UsersPrizePoolBalances
  setView: Function
  isFetched: Boolean
  depositAllowance: DepositAllowance
  callTransaction: () => Promise<TransactionResponse>
  refetch: () => {}
}

const MoreInfoView = (props: MoreInfoViewProps) => {
  const { chainId, prizePool, balances, setView } = props
  const { ticket, token } = balances

  const { t } = useTranslation()

  const isMetaMask = useIsWalletMetamask()
  const isWalletOnProperNetwork = useIsWalletOnNetwork(chainId)

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
      <BalanceBottomSheetTitle t={t} chainId={prizePool.chainId} />

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
          i18nKey='underlyingToken'
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
      <BalanceBottomSheetBackButton t={t} onClick={() => setView(DefaultBalanceSheetViews.main)} />
    </>
  )
}

const useStakingAPR = (
  chainId,
  underlyingToken,
  underlyingTokenData,
  tokenFaucetDripToken,
  dripRatePerDayUnformatted,
  ticketsData
) => {
  const { token1, token2 } = underlyingToken

  const { data: lPTokenBalances, isFetched: tokenBalancesIsFetched } = useTokenBalances(
    chainId,
    underlyingToken.address,
    [token1.address, token2.address]
  )

  const { data: tokenPrices, isFetched: tokenPricesIsFetched } = useCoingeckoTokenPrices(chainId, [
    token1.address,
    token2.address,
    tokenFaucetDripToken.address
  ])

  if (
    !tokenPricesIsFetched ||
    !tokenBalancesIsFetched ||
    !underlyingTokenData ||
    !underlyingTokenData.totalSupply
  ) {
    return null
  }

  const lpTokenPrice = calculateLPTokenPrice(
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

  const totalDailyValueUnformatted = amountMultByUsd(
    dripRatePerDayUnformatted,
    tokenPrices[tokenFaucetDripToken.address.toLowerCase()]?.usd || 0
  )

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
  const { setSelectedChainId, setIsOpen, prizePool, stakingPool, apr } = props
  const { tokenFaucetDripToken } = stakingPool.tokens

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
            chainId={prizePool.chainId}
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
            setSelectedChainId(prizePool.chainId)
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
  stakingPool: StakingPool
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
      <span className={classnames('font-bold text-lg mr-3')}>
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

  const { userData } = userLPChainData
  const { tokenFaucetDripToken } = stakingPool.tokens
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
  const { balances, stakingPool, apr } = props

  const { t } = useTranslation()

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
  const { t, stakingPool, prizePool } = props

  const { pair, symbol } = stakingPool.tokens.underlyingToken
  const { chainId } = prizePool
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
  prizePool: BalanceBottomSheetPrizePool
  tokenBalanceIsFetched: Boolean
  tokenBalance: TokenWithBalance
  ticketBalance: TokenWithBalance
  stakingPool: object
  userLPChainData: UserLPChainData
  depositTx: Transaction
  approveTx: Transaction
  underlyingToken: UnderlyingToken
  usersAddress: string
  closeInitialSheet: () => void
  setDepositTxId: (number) => void
  setApproveTxId: (number) => void
  setView: (view: DefaultBalanceSheetViews) => void
  userLPChainDataRefetch: () => {}
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
    prizePool,
    form,
    depositTx,
    tokenBalance,
    setView,
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
      <BalanceBottomSheetTitle t={t} chainId={prizePool.chainId} />

      <form onSubmit={handleSubmit(setReviewDepositView)} className='w-full'>
        <div className='w-full mx-auto'>
          <GenericDepositAmountInput
            {...props}
            depositTokenClassName='w-96'
            prizePool={prizePool}
            className=''
            form={form}
            inputKey={DEPOSIT_QUANTITY_KEY}
          />
        </div>

        <DepositInfoBox
          {...props}
          className='mt-3'
          chainId={prizePool.chainId}
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

      <BalanceBottomSheetBackButton t={t} onClick={() => setView(DefaultBalanceSheetViews.main)} />
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
    amountToDeposit,
    prizePool,
    depositAllowance,
    ticketBalance,
    tokenBalance,
    userLPChainData,
    closeInitialSheet,
    setDepositTxId,
    setApproveTxId,
    setDepositFormView,
    userLPChainDataRefetch
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
      prizePool,
      token: tokenBalance
    })

    const name = t(`allowTickerPool`, { ticker: token.symbol })
    const txId = await sendTx({
      name,
      method: 'approve',
      callTransaction,
      callbacks: {
        refetch: userLPChainDataRefetch
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
      prizePool,
      ticket: balances.ticket,
      usersAddress
    })

    const txId = await sendTx({
      name,
      method: 'depositTo',
      callTransaction,
      callbacks: {
        onSuccess,
        refetch: userLPChainDataRefetch
      }
    })
    setDepositTxId(txId)
  }

  return (
    <DepositConfirmationModal
      {...props}
      isOpen={showConfirmModal}
      closeModal={closeDepositModal}
      label='deposit confirmation modal'
      token={getToken(tokenBalance)}
      ticket={getTicket(ticketBalance)}
      isDataFetched={true}
      amountToDeposit={amountToDeposit}
      depositAllowance={depositAllowance}
      sendApproveTx={sendApproveTx}
      sendDepositTx={sendDepositTx}
      resetState={() => {}}
    />
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
  prizePool: BalanceBottomSheetPrizePool
  provider: ethers.providers.Web3Provider
  token: Token
}

const buildApproveTx = (args: BuildApproveTxArgs) => {
  const { amount, token, prizePool, provider } = args

  const signer = provider.getSigner()

  const params = [prizePool.address, amount]

  const contract = new ethers.Contract(token.address, Erc20Abi, signer)

  const contractCall: () => Promise<TransactionResponse> = contract['approve'].bind(null, ...params)

  return contractCall
}

export interface BuildDepositTxArgs {
  amount: BigNumber
  prizePool: BalanceBottomSheetPrizePool
  provider: ethers.providers.Web3Provider
  ticket: Token
  usersAddress: string
}

const buildDepositTx = (args: BuildDepositTxArgs) => {
  const { amount, prizePool, usersAddress, ticket, provider } = args

  const signer = provider.getSigner()

  const params = [usersAddress, amount, ticket.address, ethers.constants.AddressZero]

  const contract = new ethers.Contract(prizePool.address, PrizePoolAbi, signer)

  const contractCall: () => Promise<TransactionResponse> = contract['depositTo'].bind(
    null,
    ...params
  )

  return contractCall
}
