import React, { useEffect, useMemo, useState } from 'react'
import FeatherIcon from 'feather-icons-react'
import { Transaction, useTransaction, useIsWalletMetamask } from '@pooltogether/hooks'
import { PrizePool } from '@pooltogether/v4-client-js'
import { useRouter } from 'next/router'
import { useForm } from 'react-hook-form'
import { useTranslation } from 'react-i18next'
import { useOnboard } from '@pooltogether/bnc-onboard-hooks'
import { TokenIcon } from '@pooltogether/react-components'
import { AddTokenToMetamaskButton } from '@pooltogether/react-components'
import { ethers, Overrides } from 'ethers'

import { BUTTON_MIN_WIDTH } from '@constants/misc'
import { BridgeTokensModal } from '@components/Modal/BridgeTokensModal'
import { SwapTokensModalTrigger } from '@components/Modal/SwapTokensModal'
import { SelectAppChainIdModal } from '@components/SelectAppChainIdModal'
import { getAmountFromString } from '@utils/getAmountFromString'
import { useIsWalletOnNetwork } from '@hooks/useIsWalletOnNetwork'
import { useSelectedChainIdUser } from '@hooks/v4/User/useSelectedChainIdUser'
import { usePrizePoolTokens } from '@hooks/v4/PrizePool/usePrizePoolTokens'
import { usePrizePoolBySelectedChainId } from '@hooks/v4/PrizePool/usePrizePoolBySelectedChainId'
import { useUsersDepositAllowance } from '@hooks/v4/PrizePool/useUsersDepositAllowance'
import { useUsersPrizePoolBalances } from '@hooks/v4/PrizePool/useUsersPrizePoolBalances'
import { useSendTransaction } from '@hooks/useSendTransaction'
import { DepositConfirmationModal } from '@views/Deposit/DepositConfirmationModal'
import { DepositForm, DEPOSIT_QUANTITY_KEY } from '@views/Deposit/DepositForm'
import { useUsersTicketDelegate } from '@hooks/v4/PrizePool/useUsersTicketDelegate'
import { useUsersAddress } from '@hooks/useUsersAddress'

export const DepositCard = (props: { className?: string }) => {
  const { className } = props

  const router = useRouter()

  const prizePool = usePrizePoolBySelectedChainId()
  const usersAddress = useUsersAddress()
  const user = useSelectedChainIdUser()
  const { data: prizePoolTokens, isFetched: isPrizePoolTokensFetched } =
    usePrizePoolTokens(prizePool)
  const {
    data: usersBalancesData,
    refetch: refetchUsersBalances,
    isFetched: isUsersBalancesFetched
  } = useUsersPrizePoolBalances(usersAddress, prizePool)
  const usersBalances = usersBalancesData?.balances
  const {
    data: depositAllowanceUnformatted,
    refetch: refetchUsersDepositAllowance,
    isFetched: isUsersDepositAllowanceFetched
  } = useUsersDepositAllowance(prizePool)
  const {
    data: delegateData,
    isFetched: isTicketDelegateFetched,
    isFetching: isTicketDelegateFetching,
    refetch: refetchTicketDelegate
  } = useUsersTicketDelegate(usersAddress, prizePool)

  const isDataFetched =
    isPrizePoolTokensFetched &&
    isUsersDepositAllowanceFetched &&
    isUsersBalancesFetched &&
    usersBalancesData?.usersAddress === usersAddress &&
    (isTicketDelegateFetched || !isTicketDelegateFetching)

  const ticketDelegate = delegateData?.[usersAddress]

  const form = useForm({
    mode: 'onChange',
    reValidateMode: 'onChange'
  })

  const [showConfirmModal, setShowConfirmModal] = useState<boolean>(false)

  const { t } = useTranslation()

  const sendTx = useSendTransaction()

  const [transactionIds, setTransactionIds] = useState<{ [txIdKey: string]: number }>({})
  const getKey = (prizePool: PrizePool, action: string) => `${prizePool?.id()}-${action}`

  const approveTxId = transactionIds?.[getKey(prizePool, 'approve')] || 0
  const depositTxId = transactionIds?.[getKey(prizePool, 'deposit')] || 0

  const approveTx = useTransaction(approveTxId)
  const depositTx = useTransaction(depositTxId)

  const setSpecificTxId = (txId: number, prizePool: PrizePool, action: string) =>
    setTransactionIds((prevState) => ({ ...prevState, [getKey(prizePool, action)]: txId }))
  const setApproveTxId = (txId: number, prizePool: PrizePool) =>
    setSpecificTxId(txId, prizePool, 'approve')
  const setDepositTxId = (txId: number, prizePool: PrizePool) =>
    setSpecificTxId(txId, prizePool, 'deposit')

  const token = usersBalances?.token
  const ticket = usersBalances?.ticket

  const { setValue, watch, reset } = form

  const quantity = watch(DEPOSIT_QUANTITY_KEY)
  const amountToDeposit = useMemo(
    () => getAmountFromString(quantity, token?.decimals),
    [quantity, token?.decimals]
  )

  // Set quantity from the query parameter on mount
  useEffect(() => {
    try {
      const quantity = router.query[DEPOSIT_QUANTITY_KEY]
      const quantityNum = Number(quantity)
      if (quantity && !isNaN(quantityNum)) {
        setValue(DEPOSIT_QUANTITY_KEY, quantity, { shouldValidate: true })
      }
    } catch (e) {
      console.warn('Invalid query parameter for quantity')
    }
  }, [])

  /**
   * Close modal and clear tx if it has completed
   */
  const closeModal = () => {
    const { query, pathname } = router
    delete query.showConfirmModal
    router.replace({ pathname, query }, null, { scroll: false })
    setShowConfirmModal(false)
    if (depositTx?.completed) {
      setDepositTxId(0, prizePool)
    }
  }

  const sendApproveTx = async () => {
    const name = t(`allowTickerPool`, { ticker: token.symbol })
    const txId = await sendTx({
      name,
      method: 'approve',
      callTransaction: async () => user.approveDeposits(),
      callbacks: {
        refetch: () => refetchUsersDepositAllowance()
      }
    })
    setApproveTxId(txId, prizePool)
  }

  const onSuccess = (tx: Transaction) => {
    resetQueryParam()
    refetchTicketDelegate()
  }

  const sendDepositTx = async () => {
    const name = `${t('deposit')} ${amountToDeposit.amountPretty} ${token.symbol}`
    const overrides: Overrides = { gasLimit: 750000 }
    let contractMethod
    let callTransaction
    if (ticketDelegate === ethers.constants.AddressZero) {
      contractMethod = 'depositToAndDelegate'
      callTransaction = async () =>
        user.depositAndDelegate(amountToDeposit.amountUnformatted, usersAddress, overrides)
    } else {
      contractMethod = 'depositTo'
      callTransaction = async () => user.deposit(amountToDeposit.amountUnformatted, overrides)
    }

    const txId = await sendTx({
      name,
      method: contractMethod,
      callTransaction,
      callbacks: {
        onSuccess,
        refetch: () => {
          refetchUsersBalances()
        }
      }
    })
    setDepositTxId(txId, prizePool)
  }

  const resetQueryParam = () => {
    const { query, pathname } = router
    delete query[DEPOSIT_QUANTITY_KEY]
    router.replace({ pathname, query }, null, { scroll: false })
  }

  const resetState = () => {
    resetQueryParam()
    reset()
    setApproveTxId(0, prizePool)
    setDepositTxId(0, prizePool)
  }

  /**
   * Open modal and clear tx if it has completed
   */
  const openModal = () => {
    if (depositTx?.completed) {
      setDepositTxId(0, prizePool)
    }
    setShowConfirmModal(true)
  }

  return (
    <>
      <div className={className}>
        <div className='font-semibold uppercase flex items-center justify-center text-xs xs:text-sm mb-2 mt-4'>
          <span className='text-pt-purple-dark text-opacity-60 dark:text-pt-purple-lighter font-inter'>
            {t('depositOn', 'Deposit on')}
          </span>
          <SelectAppChainIdModal className='network-dropdown ml-1 xs:ml-2' />
        </div>
        <DepositForm
          form={form}
          user={user}
          prizePool={prizePool}
          token={token}
          ticket={ticket}
          isPrizePoolTokensFetched={isPrizePoolTokensFetched}
          approveTx={approveTx}
          depositTx={depositTx}
          isUsersBalancesFetched={isUsersBalancesFetched}
          isUsersDepositAllowanceFetched={isUsersDepositAllowanceFetched}
          openModal={openModal}
          amountToDeposit={amountToDeposit}
        />

        <div className='w-full flex justify-around px-2 py-4'>
          <BridgeTokensModalTrigger prizePool={prizePool} />
          <HelpLink />
          <SwapTokensModalTrigger
            chainId={prizePool.chainId}
            outputCurrencyAddress={prizePoolTokens?.token.address}
          />
        </div>
      </div>

      <DepositConfirmationModal
        chainId={prizePool.chainId}
        isOpen={showConfirmModal}
        closeModal={closeModal}
        label='deposit confirmation modal'
        token={token}
        ticket={ticket}
        isDataFetched={isDataFetched}
        amountToDeposit={amountToDeposit}
        depositAllowanceUnformatted={depositAllowanceUnformatted}
        approveTx={approveTx}
        depositTx={depositTx}
        sendApproveTx={sendApproveTx}
        sendDepositTx={sendDepositTx}
        prizePool={prizePool}
        resetState={resetState}
      />
    </>
  )
}

const HelpLink = () => {
  const { t } = useTranslation()

  return (
    <a
      href='https://docs.pooltogether.com/how-to/how-to-deposit'
      target='_blank'
      rel='noreferrer noopener'
      className='text-center text-xs text-inverse opacity-60 hover:opacity-100 transition-opacity xs:-ml-3'
      style={{ minWidth: BUTTON_MIN_WIDTH }}
    >
      <FeatherIcon
        icon={'help-circle'}
        className='relative w-4 h-4 mr-2 inline-block'
        style={{ top: -2 }}
      />

      {t('help', 'Help')}
    </a>
  )
}

interface ExternalLinkProps {
  prizePool: PrizePool
}

const BridgeTokensModalTrigger = (props: ExternalLinkProps) => {
  const { prizePool } = props
  const [showModal, setShowModal] = useState(false)

  const { t } = useTranslation()

  return (
    <>
      <button
        className='text-center text-inverse opacity-60 hover:opacity-100 transition-opacity'
        onClick={() => setShowModal(true)}
        style={{ minWidth: BUTTON_MIN_WIDTH }}
      >
        <FeatherIcon
          icon={'arrow-left'}
          className='relative w-3 h-3  inline-block'
          style={{ top: -2 }}
        />
        <FeatherIcon
          icon={'arrow-right'}
          className='relative w-3 h-3 mr-1 inline-block'
          style={{ top: -2, left: -5 }}
        />

        {t('bridgeTokens', 'Bridge tokens')}
      </button>
      <BridgeTokensModal
        label={t('ethToL2BridgeModal', 'Ethereum to L2 bridge - modal')}
        chainId={prizePool.chainId}
        isOpen={showModal}
        closeModal={() => setShowModal(false)}
      />
    </>
  )
}

const DepositAddTokenButton = (props) => {
  const { ticket, chainId } = props
  const { t } = useTranslation()

  const { wallet } = useOnboard()
  const isMetaMask = useIsWalletMetamask(wallet)
  const isWalletOnProperNetwork = useIsWalletOnNetwork(chainId)

  if (!isMetaMask) {
    return null
  }

  return (
    <AddTokenToMetamaskButton
      t={t}
      isWalletOnProperNetwork={isWalletOnProperNetwork}
      token={ticket}
      chainId={chainId}
      className='underline trans text-green hover:opacity-90 cursor-pointer flex items-center text-center font-semibold mx-auto'
    >
      <TokenIcon
        sizeClassName={'w-5 xs:w-6 h-5 xs:h-6'}
        className='mr-2'
        chainId={chainId}
        address={ticket.address}
      />{' '}
      {t('addTicketTokenToMetamask', {
        token: ticket.symbol
      })}{' '}
    </AddTokenToMetamaskButton>
  )
}
