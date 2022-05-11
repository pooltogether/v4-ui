import React, { useEffect, useMemo, useState } from 'react'
import FeatherIcon from 'feather-icons-react'
import { PrizePool } from '@pooltogether/v4-client-js'
import { useRouter } from 'next/router'
import { useForm } from 'react-hook-form'
import { useTranslation } from 'react-i18next'
import { ethers, Overrides } from 'ethers'
import { TransactionState, useTransaction } from '@pooltogether/wallet-connection'

import { BUTTON_MIN_WIDTH } from '@constants/misc'
import { BridgeTokensModal } from '@components/Modal/BridgeTokensModal'
import { SwapTokensModalTrigger } from '@components/Modal/SwapTokensModal'
import { SelectPrizePoolModal } from '@components/SelectPrizePoolModal'
import { getAmountFromString } from '@utils/getAmountFromString'
import { usePrizePoolTokens } from '@hooks/v4/PrizePool/usePrizePoolTokens'
import { useSelectedPrizePool } from '@hooks/v4/PrizePool/useSelectedPrizePool'
import { useUsersDepositAllowance } from '@hooks/v4/PrizePool/useUsersDepositAllowance'
import { useUsersPrizePoolBalances } from '@hooks/v4/PrizePool/useUsersPrizePoolBalances'
import { useSendTransaction } from '@hooks/useSendTransaction'
import { DepositConfirmationModal } from '@views/Deposit/DepositConfirmationModal'
import { DepositForm, DEPOSIT_QUANTITY_KEY } from '@views/Deposit/DepositForm'
import { useUsersTicketDelegate } from '@hooks/v4/PrizePool/useUsersTicketDelegate'
import { useUsersAddress } from '@pooltogether/wallet-connection'
import { useUsersTotalTwab } from '@hooks/v4/PrizePool/useUsersTotalTwab'
import { useGetUser } from '@hooks/v4/User/useGetUser'
import { FathomEvent, logEvent } from '@utils/services/fathom'
import { useAllUsersTicketDelegates } from '@hooks/v4/PrizePool/useAllUsersTicketDelegates'

export const DepositCard = (props: { className?: string }) => {
  const { className } = props

  const router = useRouter()

  const prizePool = useSelectedPrizePool()
  const usersAddress = useUsersAddress()
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
  const { refetch: refetchUsersTotalTwab } = useUsersTotalTwab(usersAddress)
  const getUser = useGetUser(prizePool)

  const isDataFetched =
    isPrizePoolTokensFetched &&
    isUsersDepositAllowanceFetched &&
    isUsersBalancesFetched &&
    usersBalancesData?.usersAddress === usersAddress &&
    (isTicketDelegateFetched || !isTicketDelegateFetching)

  const ticketDelegate = delegateData?.ticketDelegate

  const form = useForm({
    mode: 'onChange',
    reValidateMode: 'onChange'
  })

  const [showConfirmModal, setShowConfirmModal] = useState<boolean>(false)

  const { t } = useTranslation()

  const sendTransaction = useSendTransaction()

  const [transactionIds, setTransactionIds] = useState<{ [txIdKey: string]: string }>({})
  const getKey = (prizePool: PrizePool, action: string) => `${prizePool?.id()}-${action}`

  const approveTxId = transactionIds?.[getKey(prizePool, 'approve')] || ''
  const depositTxId = transactionIds?.[getKey(prizePool, 'save')] || ''

  const approveTx = useTransaction(approveTxId)
  const depositTx = useTransaction(depositTxId)

  const setSpecificTxId = (txId: string, prizePool: PrizePool, action: string) =>
    setTransactionIds((prevState) => ({ ...prevState, [getKey(prizePool, action)]: txId }))
  const setApproveTxId = (txId: string, prizePool: PrizePool) =>
    setSpecificTxId(txId, prizePool, 'approve')
  const setDepositTxId = (txId: string, prizePool: PrizePool) =>
    setSpecificTxId(txId, prizePool, 'save')

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
    if (depositTx?.state === TransactionState.complete) {
      setDepositTxId('', prizePool)
    }
  }

  const sendApproveTx = async () => {
    const name = t(`allowTickerPool`, { ticker: token.symbol })
    const txId = await sendTransaction({
      name,
      callTransaction: async () => {
        const user = await getUser()
        return user.approveDeposits()
      },
      callbacks: {
        onConfirmedByUser: () => logEvent(FathomEvent.approveDeposit),
        refetch: () => refetchUsersDepositAllowance()
      }
    })
    setApproveTxId(txId, prizePool)
  }

  const onSuccess = () => {
    resetQueryParam()
    refetchTicketDelegate()
  }

  const sendDepositTx = async () => {
    const name = `${t('save')} ${amountToDeposit.amountPretty} ${token.symbol}`
    const overrides: Overrides = { gasLimit: 750000 }
    let contractMethod
    let callTransaction
    if (ticketDelegate === ethers.constants.AddressZero) {
      contractMethod = 'depositToAndDelegate'
      callTransaction = async () => {
        const user = await getUser()
        return user.depositAndDelegate(amountToDeposit.amountUnformatted, usersAddress, overrides)
      }
    } else {
      contractMethod = 'depositTo'
      callTransaction = async () => {
        const user = await getUser()
        return user.deposit(amountToDeposit.amountUnformatted, overrides)
      }
    }

    const txId = await sendTransaction({
      name,
      callTransaction,
      callbacks: {
        onConfirmedByUser: () => logEvent(FathomEvent.deposit),
        onSuccess,
        refetch: () => {
          refetchUsersTotalTwab()
          refetchUsersBalances()
        }
      }
    })
    setDepositTxId(txId, prizePool)
  }

  const resetQueryParam = () => {
    const url = new URL(window.location.href)
    url.searchParams.delete(DEPOSIT_QUANTITY_KEY)
    router.replace({ pathname: url.pathname, query: url.searchParams.toString() }, null, {
      scroll: false
    })
  }

  const resetState = () => {
    resetQueryParam()
    reset()
    setApproveTxId('', prizePool)
    setDepositTxId('', prizePool)
  }

  /**
   * Open modal and clear tx if it has completed
   */
  const openModal = () => {
    if (depositTx?.state === TransactionState.complete) {
      setDepositTxId('', prizePool)
    }
    setShowConfirmModal(true)
  }

  return (
    <>
      <div className={className}>
        <div className='font-semibold uppercase flex items-center justify-center text-xs xs:text-sm mb-2 mt-4'>
          <span className='text-pt-purple-dark text-opacity-60 dark:text-pt-purple-lighter'>
            Save with
          </span>
          <SelectPrizePoolModal className='network-dropdown ml-1 xs:ml-2' />
        </div>
        <DepositForm
          form={form}
          prizePool={prizePool}
          token={token}
          ticket={ticket}
          isPrizePoolTokensFetched={isPrizePoolTokensFetched}
          approveTx={approveTx}
          depositTx={depositTx}
          isUsersBalancesFetched={isUsersBalancesFetched}
          openModal={openModal}
          amountToDeposit={amountToDeposit}
        />

        <div className='w-full flex justify-around xs:px-2 py-4'>
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
      className='text-center text-xs text-inverse opacity-60 hover:opacity-100 transition-opacity xs:-ml-3 flex flex-col items-center xs:flex-row xs:space-x-2 space-y-1 xs:space-y-0 justify-between xs:justify-center xs:space-x-2'
      style={{ minWidth: BUTTON_MIN_WIDTH }}
    >
      <FeatherIcon icon={'help-circle'} className='relative w-4 h-4 inline-block' />
      <span>{t('help', 'Help')}</span>
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
        className='text-center text-inverse opacity-60 hover:opacity-100 transition-opacity flex flex-col space-y-1 justify-between items-center xs:flex-row xs:space-y-0 xs:space-x-2'
        onClick={() => setShowModal(true)}
        style={{ minWidth: BUTTON_MIN_WIDTH }}
      >
        <div className='flex -space-x-1'>
          <FeatherIcon icon={'arrow-left'} className='relative w-3 h-3' />
          <FeatherIcon icon={'arrow-right'} className='relative w-3 h-3' />
        </div>
        <span>{t('bridgeTokens', 'Bridge tokens')}</span>
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
function useGetWalletSigner() {
  throw new Error('Function not implemented.')
}
