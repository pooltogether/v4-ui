import { TxButton } from '@components/Input/TxButton'
import { PagePadding } from '@components/Layout/PagePadding'
import { ModalTransactionSubmitted } from '@components/Modal/ModalTransactionSubmitted'
import { TokenBalance } from '@components/TokenBalance'
import { PrizePoolListItem } from '@components/PrizePoolDepositList/PrizePoolListItem'
import { PrizePoolLabel } from '@components/PrizePoolLabel'
import { NO_REFETCH } from '@constants/query'
import { useSendTransaction } from '@hooks/useSendTransaction'
import { usePrizeDistributors } from '@hooks/v4/PrizeDistributor/usePrizeDistributors'
import { useSignerGaugeController } from '@hooks/v4/PrizeDistributor/useSignerGaugeController'
import { usePrizePoolsByChainId } from '@hooks/v4/PrizePool/usePrizePoolsByChainId'
import { Token, TokenWithBalance, usePrizePoolTokens } from '@pooltogether/hooks'
import {
  BlockExplorerLink,
  BottomSheet,
  ModalTitle,
  NetworkIcon,
  Button,
  ButtonSize,
  ButtonTheme
} from '@pooltogether/react-components'
import { GaugeController, PrizePool } from '@pooltogether/v4-client-js'
import { TransactionStatus, useTransaction, useUsersAddress } from '@pooltogether/wallet-connection'
import { getAmountFromBigNumber } from '@utils/getAmountFromBigNumber'
import classNames from 'classnames'
import { BigNumber } from 'ethers'
import { formatUnits, parseUnits } from 'ethers/lib/utils'
import React, { useState } from 'react'
import { FieldValues, useForm, UseFormRegister } from 'react-hook-form'
import { useQueries, useQuery } from 'react-query'
import { ListItemTokenBalance } from '@components/PrizePoolDepositList/ListItemTokenBalance'

export const StakeUI = () => {
  const [gaugeController, setGaugeController] = useState<GaugeController>(null)
  const [ticket, setTicket] = useState<Token>(null)
  const [isGaugeEditSheetOpen, setIsGaugeEditSheetOpen] = useState<boolean>(false)
  const [isGaugeRewardClaimSheetOpen, setIsGaugeRewardClaimSheetOpen] = useState<boolean>(false)

  return (
    <PagePadding className='flex flex-col space-y-6'>
      <GaugeControllers
        openEditModal={() => setIsGaugeEditSheetOpen(true)}
        openClaimModal={() => setIsGaugeRewardClaimSheetOpen(true)}
        setTicket={setTicket}
        setGaugeController={setGaugeController}
      />
      <GaugeEditSheet
        gaugeController={gaugeController}
        ticket={ticket}
        isOpen={isGaugeEditSheetOpen}
        closeModal={() => setIsGaugeEditSheetOpen(false)}
      />
      <GaugeRewardsClaimSheet
        gaugeController={gaugeController}
        ticket={ticket}
        isOpen={isGaugeRewardClaimSheetOpen}
        closeModal={() => setIsGaugeRewardClaimSheetOpen(false)}
      />
    </PagePadding>
  )
}

const GaugeControllers: React.FC<{
  setGaugeController: (gaugeController: GaugeController) => void
  setTicket: (ticket: Token) => void
  openEditModal: () => void
  openClaimModal: () => void
}> = (props) => {
  const queriesResults = useAllGaugeControllers()
  const [isGaugeStakeSheetOpen, setIsGaugeStakeSheetOpen] = useState<boolean>(false)
  const { setGaugeController, setTicket, openEditModal, openClaimModal } = props
  return (
    <>
      {queriesResults.map((queryResults, index) => {
        const { isFetched, data: gaugeController } = queryResults
        if (!isFetched) return <div key={`gauge-controller-loading-${index}`}>Loading...</div>

        return (
          <div key={`gauge-controller-${gaugeController?.id()}`}>
            <GaugeControllerCard
              openEditModal={openEditModal}
              openClaimModal={openClaimModal}
              openStakeModal={() => setIsGaugeStakeSheetOpen(true)}
              setGaugeController={setGaugeController}
              setTicket={setTicket}
              gaugeController={gaugeController}
            />
            <GaugeStakeSheet
              key={`gauge-stake-sheet-${gaugeController?.id()}`}
              gaugeController={gaugeController}
              isOpen={isGaugeStakeSheetOpen}
              closeModal={() => setIsGaugeStakeSheetOpen(false)}
            />
          </div>
        )
      })}
    </>
  )
}

const GaugeControllerCard: React.FC<{
  gaugeController: GaugeController
  setGaugeController: (gaugeController: GaugeController) => void
  setTicket: (ticket: Token) => void
  openEditModal: () => void
  openClaimModal: () => void
  openStakeModal: () => void
}> = (props) => {
  const {
    gaugeController,
    setGaugeController,
    setTicket,
    openClaimModal,
    openEditModal,
    openStakeModal
  } = props
  const prizePools = usePrizePoolsByChainId(gaugeController?.chainId)
  const usersAddress = useUsersAddress()
  const { data: gaugeStakedBalance } = useUsersGaugeControllerBalance(usersAddress, gaugeController)
  const { data: gaugeTokenBalance } = useUsersGaugeTokenBalance(usersAddress, gaugeController)
  const { data: allowance } = useUsersGaugeDepositAllowance(usersAddress, gaugeController)
  const { data: token } = useGaugeToken(gaugeController)

  const allowanceAmount = getAmountFromBigNumber(allowance?.allowanceUnformatted, token?.decimals)
  const stakedAmount = getAmountFromBigNumber(gaugeStakedBalance, token?.decimals)
  const balanceAmount = getAmountFromBigNumber(gaugeTokenBalance, token?.decimals)

  return (
    <div className='rounded-lg p-4 space-y-4 bg-pt-purple-lightest dark:bg-pt-purple'>
      <div className='flex justify-between'>
        <div>
          <div className='space-x-2 flex items-center'>
            <NetworkIcon chainId={gaugeController?.chainId} />
            <span className='font-bold text-lg '>Gauge Controller</span>
          </div>
          <div className='space-x-2 flex items-center'>
            <BlockExplorerLink
              address={gaugeController?.address}
              chainId={gaugeController?.chainId}
              copyable
              shorten
            />
          </div>
        </div>
        <div>
          <Button onClick={openStakeModal} size={ButtonSize.sm}>{`Stake ${token?.symbol}`}</Button>
        </div>
      </div>

      <div className='bg-white rounded bg-opacity-10 p-4'>
        <div className='flex justify-between'>
          <span>{`${token?.symbol} balance`}</span>
          <span>{balanceAmount?.amountPretty}</span>
        </div>
        <div className='flex justify-between'>
          <span>{`Staked ${token?.symbol}`}</span>
          <span>{stakedAmount?.amountPretty}</span>
        </div>
        <div className='flex justify-between'>
          <span>Allowance</span>
          <span>{allowanceAmount?.amountPretty}</span>
        </div>
      </div>
      <div className='space-y-2'>
        <div className='font-bold'>Prize Pool Gauges</div>
        <ul className='space-y-4'>
          {prizePools.map((prizePool) => (
            <GaugeRow
              key={`gauge-row-${prizePool.id()}-${gaugeController?.id()}`}
              gaugeController={gaugeController}
              prizePool={prizePool}
              setGaugeController={setGaugeController}
              setTicket={setTicket}
              openModal={openEditModal}
            />
          ))}
        </ul>
        <div className='font-bold'>Gauge Rewards</div>
        <ul className='space-y-4'>
          {prizePools.map((prizePool) => (
            <GaugeRewardsRow
              key={`gauge-rewards-row-${prizePool.id()}-${gaugeController?.id()}`}
              gaugeController={gaugeController}
              prizePool={prizePool}
              setGaugeController={setGaugeController}
              setTicket={setTicket}
              openModal={openClaimModal}
            />
          ))}
        </ul>
      </div>
    </div>
  )
}

const GaugeRow: React.FC<{
  gaugeController: GaugeController
  prizePool: PrizePool
  setGaugeController: (gaugeController: GaugeController) => void
  setTicket: (ticket: Token) => void
  openModal: () => void
}> = (props) => {
  const { gaugeController, prizePool, setGaugeController, setTicket, openModal } = props
  const usersAddress = useUsersAddress()
  const { data: tokens } = usePrizePoolTokens(prizePool)
  const { data: balance } = useUsersGaugeBalance(
    usersAddress,
    tokens?.ticket.address,
    gaugeController
  )
  const { data: token } = useGaugeToken(gaugeController)

  const tokenWithBalance = makeTokenWithBalance(token, balance)

  return (
    <PrizePoolListItem
      left={<PrizePoolLabel prizePool={prizePool} />}
      right={<ListItemTokenBalance chainId={gaugeController?.chainId} token={tokenWithBalance} />}
      onClick={() => {
        setTicket(tokens.ticket)
        setGaugeController(gaugeController)
        openModal()
      }}
    />
  )
}

const GaugeRewardsRow: React.FC<{
  gaugeController: GaugeController
  prizePool: PrizePool
  setGaugeController: (gaugeController: GaugeController) => void
  setTicket: (ticket: Token) => void
  openModal: () => void
}> = (props) => {
  const { gaugeController, prizePool, setGaugeController, setTicket, openModal } = props
  const usersAddress = useUsersAddress()
  const { data: tokens } = usePrizePoolTokens(prizePool)
  const { data: rewardToken } = useGaugeRewardToken(gaugeController, tokens?.ticket.address)
  const { data: balanceUnformatted } = useUsersClaimableGaugeRewardBalance(
    usersAddress,
    gaugeController,
    tokens?.ticket.address,
    rewardToken?.address
  )

  const tokenWithBalance = makeTokenWithBalance(rewardToken, balanceUnformatted)

  return (
    <PrizePoolListItem
      left={<PrizePoolLabel prizePool={prizePool} />}
      right={<ListItemTokenBalance chainId={gaugeController?.chainId} token={tokenWithBalance} />}
      onClick={() => {
        setTicket(tokens.ticket)
        setGaugeController(gaugeController)
        openModal()
      }}
    />
  )
}

const GaugeEditSheet: React.FC<{
  gaugeController: GaugeController
  ticket: Token
  isOpen: boolean
  closeModal: () => void
}> = (props) => {
  const { gaugeController, ticket, isOpen, closeModal } = props
  return (
    <BottomSheet
      open={isOpen}
      onDismiss={closeModal}
      label='Gauge edit modal'
      className='space-y-4'
    >
      <ModalTitle chainId={gaugeController?.chainId} title={'Edit Gauge'} />
      <p>Set the amount of POOL staked on this Gauge</p>
      <GaugeEditForm gaugeController={gaugeController} ticket={ticket} />
    </BottomSheet>
  )
}

const GaugeRewardsClaimSheet: React.FC<{
  gaugeController: GaugeController
  ticket: Token
  isOpen: boolean
  closeModal: () => void
}> = (props) => {
  const { gaugeController, ticket, isOpen, closeModal } = props

  const sendTx = useSendTransaction()
  const usersAddress = useUsersAddress()
  const { data: rewardToken } = useGaugeRewardToken(gaugeController, ticket?.address)

  // Claim Rewards
  const [claimTransactionId, setClaimTransactionId] = useState('')
  const claimTransaction = useTransaction(claimTransactionId)
  const {
    data: claimableBalanceUnformatted,
    error: claimableError,
    isFetched: isClaimableBalanceFetched,
    refetch: refetchUsersClaimableGaugeRewardBalance
  } = useUsersClaimableGaugeRewardBalance(
    usersAddress,
    gaugeController,
    ticket?.address,
    rewardToken?.address
  )
  const claimableTokenWithBalance = makeTokenWithBalance(rewardToken, claimableBalanceUnformatted)

  // Redeem Rewards
  const [redeemTransactionId, setRedeemTransactionId] = useState('')
  const redeemTransaction = useTransaction(redeemTransactionId)
  const {
    data: redeemableBalanceUnformatted,
    error: redeemableError,
    isFetched: isRedeemableBalanceFetched,
    refetch: refetchUsersRedeemableGaugeRewardBalance
  } = useUsersRedeemableGaugeRewardBalance(usersAddress, gaugeController, ticket?.address)
  const redeemableTokenWithBalance = makeTokenWithBalance(rewardToken, redeemableBalanceUnformatted)

  const claimRewards = async () =>
    setClaimTransactionId(
      sendTx({
        name: 'Claim Rewards',
        callTransaction: () =>
          gaugeController.claimCurrentUserRewards(ticket?.address, usersAddress),
        callbacks: {
          refetch: () => {
            refetchUsersRedeemableGaugeRewardBalance()
            refetchUsersClaimableGaugeRewardBalance()
            // TODO: Probably also trigger a fetch for the users balance for the reward token
          }
        }
      })
    )

  const redeemRewards = async () =>
    setClaimTransactionId(
      sendTx({
        name: 'Redeem Rewards',
        callTransaction: () =>
          gaugeController.redeemUserRewards(rewardToken?.address, usersAddress),
        callbacks: {
          refetch: () => {
            refetchUsersRedeemableGaugeRewardBalance()
            // TODO: Probably also trigger a fetch for the users balance for the reward token
          }
        }
      })
    )

  console.log({
    isClaimableBalanceFetched,
    isRedeemableBalanceFetched,
    redeemableError,
    claimableError
  })

  return (
    <BottomSheet
      open={isOpen}
      onDismiss={closeModal}
      label='Gauge edit modal'
      className='space-y-4'
    >
      <ModalTitle chainId={gaugeController?.chainId} title={'Claim Rewards'} />
      <div className='flex justify-between bg-actually-black bg-opacity-5 rounded p-2'>
        <span>Claimable rewards:</span>
        <TokenBalance
          chainId={gaugeController?.chainId}
          token={claimableTokenWithBalance}
          error={!!claimableError}
        />
      </div>
      <div className='text-xxs'>
        Claiming rewards preps any token rewards from a gauge to be redeemed.
      </div>
      <TxButton
        chainId={gaugeController?.chainId}
        state={claimTransaction?.state}
        status={claimTransaction?.status}
        onClick={claimRewards}
        disabled={
          !isClaimableBalanceFetched || !!claimableError || claimableBalanceUnformatted.isZero()
        }
        className='w-full'
      >
        Claim
      </TxButton>
      <div className='flex justify-between bg-actually-black bg-opacity-5 rounded p-2'>
        <span>Redeemable rewards:</span>
        <TokenBalance
          chainId={gaugeController?.chainId}
          token={redeemableTokenWithBalance}
          error={!!redeemableError}
        />
      </div>
      <div className='text-xxs'>
        Redeeming rewards transfers claimed rewards for a particular reward token across multiple
        gauges.
      </div>
      <TxButton
        chainId={gaugeController?.chainId}
        state={redeemTransaction?.state}
        status={redeemTransaction?.status}
        onClick={redeemRewards}
        disabled={
          !isRedeemableBalanceFetched || !!redeemableError || redeemableBalanceUnformatted.isZero()
        }
        className='w-full'
      >
        Redeem
      </TxButton>
    </BottomSheet>
  )
}

const GAUGE_EDIT_KEY = 'gauge-edit'

// TODO: Ensure allowance is valid before rendering this form.
const GaugeEditForm: React.FC<{
  gaugeController: GaugeController
  ticket: Token
}> = (props) => {
  const { gaugeController: _gaugeController, ticket } = props
  const gaugeController = useSignerGaugeController(_gaugeController)
  const {
    handleSubmit,
    register,
    setValue,
    trigger,
    watch,
    formState: { errors, isValid }
  } = useForm({
    mode: 'onChange',
    reValidateMode: 'onChange'
  })
  const sendTx = useSendTransaction()
  const [transactionId, setTransactionId] = useState('')
  const transaction = useTransaction(transactionId)
  const usersAddress = useUsersAddress()
  const { data: token } = useGaugeToken(gaugeController)
  const { data: balanceUnformatted, refetch: refetchGaugeBalance } = useUsersGaugeBalance(
    usersAddress,
    ticket?.address,
    gaugeController
  )
  const { refetch: refetchGaugeControllerBalance } = useUsersGaugeControllerBalance(
    usersAddress,
    gaugeController
  )

  const valitdationRules = {
    // isValidAddress: (x: string) =>
    //   isAddress(x) ? true : 'Please enter a valid address'
  }

  const amount = watch(GAUGE_EDIT_KEY)
  const errorMessage = errors?.[GAUGE_EDIT_KEY]?.message

  const sendGaugeEditTx = async (amount: string) => {
    const amountUnformatted = parseUnits(amount, token?.decimals)

    let callTransaction
    if (amountUnformatted.gt(balanceUnformatted)) {
      const differenceUnformatted = amountUnformatted.sub(balanceUnformatted)
      callTransaction = () =>
        gaugeController.increaseGauge(ticket?.address, differenceUnformatted, { gasLimit: 5000000 })
    } else {
      const differenceUnformatted = balanceUnformatted.sub(amountUnformatted)
      callTransaction = () =>
        gaugeController.decreaseGauge(ticket?.address, differenceUnformatted, { gasLimit: 5000000 })
    }

    const transactionId = await sendTx({
      name: 'Set Gauge',
      callTransaction,
      callbacks: {
        refetch: () => {
          refetchGaugeControllerBalance()
          refetchGaugeBalance()
        }
      }
    })
    setTransactionId(transactionId)
  }

  if (
    transaction?.status === TransactionStatus.pendingBlockchainConfirmation ||
    transaction?.status === TransactionStatus.success
  ) {
    return (
      <>
        <ModalTransactionSubmitted chainId={gaugeController?.chainId} tx={transaction} />
        <Button
          className='w-full'
          theme={ButtonTheme.orangeOutline}
          onClick={() => setTransactionId('')}
        >
          Clear
        </Button>
      </>
    )
  }

  return (
    <>
      <form className='flex flex-col'>
        <Input
          inputKey={GAUGE_EDIT_KEY}
          register={register}
          validate={valitdationRules}
          autoComplete='off'
        />
        <div className='h-8 text-pt-red text-center'>
          <span>{errorMessage}</span>
        </div>
      </form>
      <TxButton
        chainId={gaugeController?.chainId}
        className='w-full'
        type='submit'
        disabled={!isValid || !ticket || !token}
        onClick={() => sendGaugeEditTx(amount)}
      >
        Set Gauge
      </TxButton>
    </>
  )
}

interface GaugeStakeSheetProps {
  gaugeController: GaugeController
  isOpen: boolean
  closeModal: () => void
}

const GaugeStakeSheet: React.FC<GaugeStakeSheetProps> = (props) => {
  const { gaugeController, isOpen, closeModal } = props
  return (
    <BottomSheet
      open={isOpen}
      onDismiss={closeModal}
      label='Gauge stake modal'
      className='space-y-4'
    >
      <ModalTitle chainId={gaugeController?.chainId} title={'Stake POOL'} />
      <p>Set the amount of POOL you want to be staked</p>
      <GaugeStakeForm gaugeController={gaugeController} />
    </BottomSheet>
  )
}

const GaugeStakeForm: React.FC<{ gaugeController: GaugeController }> = (props) => {
  const { gaugeController: _gaugeController } = props
  const gaugeController = useSignerGaugeController(_gaugeController)
  const usersAddress = useUsersAddress()
  const { data: token } = useGaugeToken(gaugeController)
  const { data: balanceUnformatted, refetch: refetchGaugeBalance } = useUsersGaugeControllerBalance(
    usersAddress,
    gaugeController
  )
  const { refetch: refetchApprovalAmount } = useUsersGaugeDepositAllowance(
    usersAddress,
    gaugeController
  )
  const {
    handleSubmit,
    register,
    setValue,
    trigger,
    watch,
    formState: { errors, isValid }
  } = useForm({
    mode: 'onChange',
    reValidateMode: 'onChange',
    defaultValues: {
      [GAUGE_EDIT_KEY]:
        !!token && !!balanceUnformatted ? formatUnits(balanceUnformatted, token.decimals) : ''
    }
  })
  const sendTx = useSendTransaction()
  const [transactionId, setTransactionId] = useState('')
  const transaction = useTransaction(transactionId)

  const { refetch: refetchGaugeTokenBalance } = useUsersGaugeTokenBalance(
    usersAddress,
    gaugeController
  )

  const amount = watch(GAUGE_EDIT_KEY)
  const valitdationRules = {
    // isValidAddress: (x: string) =>
    //   isAddress(x) ? true : 'Please enter a valid address'
  }

  const errorMessage = errors?.[GAUGE_EDIT_KEY]?.message

  const sendGaugeEditTx = async (amount: string) => {
    const amountUnformatted = parseUnits(amount, token?.decimals)

    let callTransaction
    if (amountUnformatted.gt(balanceUnformatted)) {
      const differenceUnformatted = amountUnformatted.sub(balanceUnformatted)
      callTransaction = () => gaugeController.deposit(differenceUnformatted)
    } else {
      const differenceUnformatted = balanceUnformatted.sub(amountUnformatted)
      callTransaction = () => gaugeController.withdraw(differenceUnformatted)
    }

    const transactionId = await sendTx({
      name: 'Edit Gauge',
      callTransaction,
      callbacks: {
        refetch: () => {
          refetchGaugeBalance()
          refetchGaugeTokenBalance()
        }
      }
    })
    setTransactionId(transactionId)
  }

  const sendGaugeApprovalTx = async () => {
    const transactionId = await sendTx({
      name: 'Approve POOL for Gauge',
      callTransaction: () => gaugeController.approveDepositing(),
      callbacks: {
        refetch: () => {
          refetchApprovalAmount()
          refetchGaugeBalance()
          refetchGaugeTokenBalance()
        }
      }
    })
    setTransactionId(transactionId)
  }

  if (
    transaction?.status === TransactionStatus.pendingBlockchainConfirmation ||
    transaction?.status === TransactionStatus.success
  ) {
    return (
      <>
        <ModalTransactionSubmitted chainId={gaugeController?.chainId} tx={transaction} />
        <Button
          className='w-full'
          theme={ButtonTheme.orangeOutline}
          onClick={() => setTransactionId('')}
        >
          Clear
        </Button>
      </>
    )
  }

  return (
    <>
      <form className='flex flex-col'>
        <Input
          inputKey={GAUGE_EDIT_KEY}
          register={register}
          validate={valitdationRules}
          autoComplete='off'
        />
        <div className='h-8 text-pt-red text-center'>
          <span>{errorMessage}</span>
        </div>
      </form>
      <TxButton
        chainId={gaugeController?.chainId}
        className='w-full'
        type='button'
        disabled={!isValid || !token}
        onClick={() => sendGaugeEditTx(amount)}
      >
        Update Gauge
      </TxButton>
      <TxButton
        chainId={gaugeController?.chainId}
        className='w-full'
        type='button'
        onClick={() => sendGaugeApprovalTx()}
      >
        Approve Deposits
      </TxButton>
    </>
  )
}

interface InputProps {
  inputKey: string
  register: UseFormRegister<FieldValues>
  autoComplete?: string
  validate: {
    [key: string]: (value: string) => boolean | string
  }
}

const Input = (props: InputProps) => {
  const { inputKey, register, validate, autoComplete } = props
  return (
    <div
      className={classNames(
        'p-0.5 bg-body rounded-lg overflow-hidden',
        'transition-all hover:bg-gradient-cyan focus-within:bg-pt-gradient',
        'cursor-pointer'
      )}
    >
      <div className='bg-body w-full rounded-lg flex'>
        <input
          className={classNames(
            'bg-transparent w-full outline-none focus:outline-none active:outline-none py-4 pr-8 pl-4 font-semibold'
          )}
          placeholder='1000'
          autoComplete={autoComplete}
          {...register(inputKey, { required: true, validate })}
        />
      </div>
    </div>
  )
}

///////////////////////// Methods

const makeTokenWithBalance = (
  token: Token | undefined,
  balanceUnformatted: BigNumber | undefined
): TokenWithBalance => {
  if (!token || !balanceUnformatted) return undefined
  const amount = getAmountFromBigNumber(balanceUnformatted, token.decimals)
  return {
    ...amount,
    ...token,
    hasBalance: !balanceUnformatted.isZero()
  }
}

/////////////////// HOOKS

const useAllGaugeControllers = () => {
  const prizeDistributors = usePrizeDistributors()
  return useQueries(
    prizeDistributors.map((prizeDistributor) => ({
      ...NO_REFETCH,
      queryKey: ['useAllGaugeControllers', prizeDistributor.id()],
      queryFn: () => prizeDistributor.getGaugeController()
    }))
  )
}

const useAllUsersGaugeDepositAllowances = (usersAddress: string) => {
  const queriesResults = useAllGaugeControllers()
  return useQueries(
    queriesResults.map(({ data: gaugeController, isFetched }) => ({
      ...NO_REFETCH,
      enabled: isFetched,
      queryKey: ['useAllUsersGaugeDepositAllowances', gaugeController?.id(), usersAddress],
      queryFn: () => gaugeController.getUserDepositAllowance(usersAddress)
    }))
  )
}

const useUsersGaugeDepositAllowance = (usersAddress: string, gaugeController: GaugeController) => {
  return useQuery(
    ['useAllUsersGaugeDepositAllowances', gaugeController?.id(), usersAddress],
    () => gaugeController.getUserDepositAllowance(usersAddress),
    { ...NO_REFETCH, enabled: !!gaugeController && !!usersAddress }
  )
}

const useUsersGaugeBalance = (
  usersAddress: string,
  ticketAddress: string,
  gaugeController: GaugeController
) => {
  return useQuery(
    ['useUsersGaugeBalance', gaugeController?.id(), usersAddress, ticketAddress],
    () => gaugeController.getUserGaugeBalance(usersAddress, ticketAddress),
    { ...NO_REFETCH, enabled: !!gaugeController && !!usersAddress && !!ticketAddress }
  )
}

const useUsersGaugeTokenBalance = (usersAddress: string, gaugeController: GaugeController) => {
  return useQuery(
    ['useUsersGaugeTokenBalance', gaugeController?.id(), usersAddress],
    () => gaugeController.getUserGaugeTokenBalance(usersAddress),
    { ...NO_REFETCH, enabled: !!gaugeController && !!usersAddress }
  )
}

const useUsersGaugeControllerBalance = (usersAddress: string, gaugeController: GaugeController) => {
  return useQuery(
    ['useUsersGaugeControllerBalance', gaugeController?.id(), usersAddress],
    () => gaugeController.getGaugeControllerBalance(usersAddress),
    { ...NO_REFETCH, enabled: !!gaugeController && !!usersAddress }
  )
}

const useGaugeToken = (gaugeController: GaugeController) => {
  return useQuery(
    ['useGaugeToken', gaugeController?.id()],
    () => gaugeController.getGaugeTokenData(),
    {
      ...NO_REFETCH,
      enabled: !!gaugeController
    }
  )
}

const useGaugeRewardToken = (gaugeController: GaugeController, ticketAddress: string) => {
  return useQuery(
    ['useGaugeRewardToken', gaugeController?.id(), ticketAddress],
    () => gaugeController.getGaugeRewardToken(ticketAddress),
    {
      ...NO_REFETCH,
      enabled: !!gaugeController && !!ticketAddress
    }
  )
}

const useUsersClaimableGaugeRewardBalance = (
  usersAddress: string,
  gaugeController: GaugeController,
  ticketAddress: string,
  rewardTokenAddress: string
) => {
  return useQuery(
    [
      'useUsersClaimableGaugeRewardBalance',
      gaugeController?.id(),
      usersAddress,
      ticketAddress,
      rewardTokenAddress
    ],
    () =>
      gaugeController.getUserClaimableGaugeRewardBalance(
        usersAddress,
        ticketAddress,
        rewardTokenAddress
      ),
    {
      ...NO_REFETCH,
      enabled: !!gaugeController && !!ticketAddress && !!usersAddress && !!rewardTokenAddress
    }
  )
}

const useUsersRedeemableGaugeRewardBalance = (
  usersAddress: string,
  gaugeController: GaugeController,
  ticketAddress: string
) => {
  return useQuery(
    ['useUsersRedeemableGaugeRewardBalance', gaugeController?.id(), usersAddress, ticketAddress],
    () => gaugeController.getUserRedeemableGaugeRewardBalance(usersAddress, ticketAddress),
    {
      ...NO_REFETCH,
      enabled: !!gaugeController && !!ticketAddress && !!usersAddress
    }
  )
}
