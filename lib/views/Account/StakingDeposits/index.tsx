import React, { useMemo, useState } from 'react'
import classnames from 'classnames'
import FeatherIcon from 'feather-icons-react'
import { BigNumber } from 'ethers'
import { FieldValues, UseFormReturn } from 'react-hook-form'
import { useOnboard } from '@pooltogether/bnc-onboard-hooks'
import { useTranslation } from 'react-i18next'
import { PrizePool } from '@pooltogether/v4-js-client'
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
  toScaledUsdBigNumber
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
  Amount
} from '@pooltogether/hooks'
import { formatUnits } from 'ethers/lib/utils'

import { VAPRTooltip } from 'lib/components/VAPRTooltip'
import { GenericDepositAmountInput } from 'lib/components/Input/GenericDepositAmountInput'
import { useUsersAddress } from 'lib/hooks/useUsersAddress'
import { DepositAllowance } from 'lib/hooks/Tsunami/PrizePool/useUsersDepositAllowance'
import { UsersPrizePoolBalances } from 'lib/hooks/Tsunami/PrizePool/useUsersPrizePoolBalances'
import { useSelectedChainId } from 'lib/hooks/useSelectedChainId'
import { useIsWalletMetamask } from 'lib/hooks/useIsWalletMetamask'
import { useIsWalletOnNetwork } from 'lib/hooks/useIsWalletOnNetwork'
import { BottomButton, DepositInfoBox } from 'lib/views/Deposit/DepositForm'
import { RevokeAllowanceButton } from 'lib/views/RevokeAllowanceButton'
import { getAmountFromString } from 'lib/utils/getAmountFromString'

export const DEPOSIT_QUANTITY_KEY = 'amountToDeposit'

const TOKEN_IMG_URL = {
  PTaUSDC: 'https://app.pooltogether.com/ptausdc@2x.png'
}

export interface TokenFaucetDripToken {
  address: string
  symbol: string
}

export interface StakingPoolTokens {
  underlyingToken: object
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
      <h4 className='mb-2'>{t('staking')}</h4>

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
        usersAddress={usersAddress}
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
  usersAddress: string
  wallet: object
  network: number
  chainId: number
  stakingPool: StakingPool
  prizePool: PrizePool
}

const StakingDepositItem = (props: StakingDepositItemProps) => {
  const { prizePool, chainId, stakingPool, wallet, network, usersAddress } = props

  const { t } = useTranslation()

  const [isOpen, setIsOpen] = useState(false)
  const [selectedView, setView] = useState(DefaultBalanceSheetViews.main)

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

  const [withdrawTxId, setWithdrawTxId] = useState(0)
  const withdrawTx = useTransaction(withdrawTxId)

  const { tokenFaucetData, underlyingTokenData, ticketsData } = stakingPoolChainData || {}
  const { dripRatePerDayUnformatted } = tokenFaucetData || {}
  const { tokens } = stakingPool || {}
  const { underlyingToken, tokenFaucetDripToken } = tokens || {}

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

  const refetch = () => {
    stakingPoolChainDataRefetch()
    userLPChainDataRefetch()
  }

  let balances, tokenBalance, ticketBalance

  if (userLPChainData) {
    balances = userLPChainData.balances
    tokenBalance = balances.token
    ticketBalance = balances.ticket
  }

  const depositAllowance: DepositAllowance = getDepositAllowance(userLPChainData)
  console.log({ depositAllowance })

  const depositView = (
    <DepositView
      {...props}
      setView={setView}
      userLPChainData={userLPChainData}
      tokenBalanceIsFetched={userLPChainDataIsFetched}
      ticketBalance={ticketBalance}
      tokenBalance={tokenBalance}
      depositTx={depositTx}
    />
  )
  const withdrawView = <div>hi</div>
  const moreInfoView = (
    <MoreInfoView
      {...props}
      depositAllowance={depositAllowance}
      balances={balances}
      setView={setView}
      callTransaction={() => {}}
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

  const view = (
    <>
      <StakingBalanceStats {...props} apr={apr} t={t} balances={balances} />

      <ManageDepositButton
        {...props}
        setIsOpen={setIsOpen}
        setSelectedChainId={setSelectedChainId}
      />
    </>
  )

  // const view = balances.ticket.hasBalance ? (
  //   <>
  //     <StakingBalanceStats {...props} apr={apr} t={t} balances={balances} />

  //     <ManageDepositButton
  //       {...props}
  //       setIsOpen={setIsOpen}
  //       setSelectedChainId={setSelectedChainId}
  //     />
  //   </>
  // ) : (
  //   <BlankStateView
  //     {...props}
  //     setIsOpen={setIsOpen}
  //     setSelectedChainId={setSelectedChainId}
  //     apr={apr}
  //   />
  // )

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

  // depositAllowance={DepositAllowance}
  // isFetched={isFetched}
  // callTransaction={callTransaction}
  // refetch={refetch}

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
      <BalanceBottomSheetBackButton onClick={() => setView(DefaultBalanceSheetViews.main)} />
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
        {t(
          'lpStakingRewardsDescription',
          'Add liquidity to the POOL/ETH pair on Uniswap and deposit LP tokens to earn extra POOL!'
        )}
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
          className='flex items-center transition uppercase font-semibold text-lg opacity-90 hover:opacity-100'
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
          {t('deposit', 'Deposit')} <StakingDepositBalance {...props} balances={props.balances} />
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
        className='flex items-center transition uppercase font-semibold text-lg opacity-90 hover:opacity-100'
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
  const { balances, stakingPool } = props

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
      <span className='font-bold text-lg mr-3'> num {tokenFaucetDripToken.symbol}</span>
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

export interface UserLPChainData {
  userData: { underlyingToken: { allowance: BigNumber } }
  balances: object
}

export interface DepositViewProps {
  prizePool: { chainId: number }
  tokenBalanceIsFetched: Boolean
  tokenBalance: TokenWithBalance
  ticketBalance: TokenWithBalance
  stakingPool: object
  userLPChainData: UserLPChainData
  setView: (view: DefaultBalanceSheetViews) => void
  depositTx: Transaction
}

export enum DepositViews {
  'deposit',
  'review'
}

const DepositView = (props: DepositViewProps) => {
  const { depositTx } = props

  const [depositView, setDepositView] = useState(DepositViews.deposit)

  const form = useForm({
    mode: 'onChange',
    reValidateMode: 'onChange'
  })

  const setReviewDeposit = () => {
    setDepositView(DepositViews.review)
  }

  switch (depositView) {
    case DepositViews.deposit:
      return (
        <DepositFormView
          {...props}
          form={form}
          depositTx={depositTx}
          setDepositView={setDepositView}
          setReviewDeposit={setReviewDeposit}
        />
      )
    case DepositViews.review:
      return <DepositReviewView {...props} setDepositView={setDepositView} />
  }
}

export interface DepositFormViewProps extends DepositViewProps {
  form: UseFormReturn<FieldValues, object>
  // amountToDeposit: Amount
  setDepositView: (view: DepositViews) => void
  setReviewDeposit: () => void
}

const DepositFormView = (props: DepositFormViewProps) => {
  const { userLPChainData, setReviewDeposit, prizePool, setView, form, depositTx, tokenBalance } =
    props

  const { t } = useTranslation()

  const { isWalletConnected } = useOnboard()

  const {
    handleSubmit,
    formState: { isValid, isDirty, errors },
    watch
  } = form

  const quantity = watch(DEPOSIT_QUANTITY_KEY)
  const amountToDeposit = useMemo(
    () => getAmountFromString(quantity, tokenBalance?.decimals),
    [quantity, tokenBalance?.decimals]
  )

  const token: Token = {
    address: tokenBalance.address,
    decimals: tokenBalance.decimals,
    name: tokenBalance.name,
    symbol: tokenBalance.symbol
  }

  const depositAllowance: DepositAllowance = getDepositAllowance(userLPChainData, amountToDeposit)
  console.log({ depositAllowance })

  // import { useSelectedChainIdUser } from 'lib/hooks/Tsunami/User/useSelectedChainIdUser'
  // const user = useSelectedChainIdUser()
  // const {
  //   data: depositAllowance,
  //   refetch: refetchUsersDepositAllowance,
  //   isFetched
  // } = useUsersDepositAllowance(prizePool)
  // const callTransaction = async () => user.approveDeposits(BigNumber.from(0))
  // const refetch = () => refetchUsersDepositAllowance()

  return (
    <>
      <BalanceBottomSheetTitle t={t} chainId={prizePool.chainId} />

      <form onSubmit={handleSubmit(setReviewDeposit)} className='w-full'>
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
          className='mt-3'
          chainId={prizePool.chainId}
          depositTx={depositTx}
          depositAllowance={depositAllowance}
          amountToDeposit={amountToDeposit}
          errors={isDirty ? errors : null}
        />

        <BottomButton
          className='mt-4 w-full'
          disabled={(!isValid && isDirty) || depositTx?.inFlight}
          depositTx={depositTx}
          isWalletConnected={isWalletConnected}
          tokenBalance={tokenBalance}
          token={token}
          amountToDeposit={amountToDeposit}
        />
      </form>

      <BalanceBottomSheetBackButton onClick={() => setView(DefaultBalanceSheetViews.main)} />
    </>
  )
}

export interface DepositReviewViewProps extends DepositViewProps {
  setDepositView: (view: DepositViews) => void
}

const DepositReviewView = (props: DepositReviewViewProps) => {
  return null
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
