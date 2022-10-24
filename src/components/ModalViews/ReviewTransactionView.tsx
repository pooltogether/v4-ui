import { TxButton } from '@components/Input/TxButton'
import { TransactionReceiptButton } from '@components/TransactionReceiptButton'
import { TransactionTosDisclaimer } from '@components/TransactionTosDisclaimer'
import { useSelectedChainId } from '@hooks/useSelectedChainId'
import { usePrizePoolTokens } from '@hooks/v4/PrizePool/usePrizePoolTokens'
import { useSelectedPrizePool } from '@hooks/v4/PrizePool/useSelectedPrizePool'
import { Amount, useTokenAllowance } from '@pooltogether/hooks'
import { Button, ButtonRadius, ButtonTheme, ViewProps } from '@pooltogether/react-components'
import {
  Transaction,
  TransactionState,
  TransactionStatus,
  useApproveErc20,
  useTransaction,
  useUsersAddress
} from '@pooltogether/wallet-connection'
import { ModalApproveGate } from '@views/Deposit/ModalApproveGate'
import { ModalLoadingGate } from '@views/Deposit/ModalLoadingGate'
import { useState } from 'react'
import { useTranslation } from 'react-i18next'

export interface ReviewTransactionViewProps extends ViewProps {
  transaction: Transaction
  sendTransaction: () => void
  clearTransaction: () => void
  connectWallet: () => void
  setApproveTransactionId?: (id: string) => void
  isFetched?: boolean
  successView?: React.ReactNode
  reviewView?: React.ReactNode
  footerContent?: React.ReactNode
  spenderAddress?: string
  tokenAddress?: string
  amount?: Amount
  buttonTexti18nKey?: string
}

/**
 * Includes option ERC20 token approval support. The view will add an additional stepper and approve step to the view so users are carried through the approval process when necessary.
 * @param props
 * @returns
 */
export const ReviewTransactionView: React.FC<ReviewTransactionViewProps> = (props) => {
  const {
    previous,
    sendTransaction,
    clearTransaction,
    connectWallet,
    isFetched,
    successView,
    reviewView,
    footerContent,
    transaction,
    amount,
    spenderAddress,
    tokenAddress,
    buttonTexti18nKey,
    setApproveTransactionId: _setApproveTransactionId
  } = props
  const { chainId } = useSelectedChainId()
  const prizePool = useSelectedPrizePool()
  const usersAddress = useUsersAddress()

  const {
    data: allowanceUnformatted,
    isFetched: isTokenAllowanceFetched,
    refetch: refetchTokenAllowance,
    isIdle
  } = useTokenAllowance(chainId, usersAddress, spenderAddress, tokenAddress)
  const [approveTransactionId, setApproveTransactionId] = useState('')
  const approveTransaction = useTransaction(approveTransactionId)
  const _sendApproveTx = useApproveErc20(tokenAddress, spenderAddress, {
    callbacks: { onSuccess: () => refetchTokenAllowance() }
  })
  const { isFetched: isTokensFetched } = usePrizePoolTokens(prizePool)
  const amountUnformatted = amount?.amountUnformatted

  const sendApproveTx = async () => {
    const transactionId = await _sendApproveTx()
    setApproveTransactionId(transactionId)
    _setApproveTransactionId?.(transactionId)
  }

  const { t } = useTranslation()

  if (
    !isTokensFetched ||
    (!isIdle && !isTokenAllowanceFetched) ||
    (isFetched !== undefined && !isFetched)
  ) {
    return (
      <>
        <ModalLoadingGate />
      </>
    )
  } else if (!isIdle && !!amountUnformatted && allowanceUnformatted?.lt(amountUnformatted)) {
    return (
      <>
        <ModalApproveGate
          connectWallet={connectWallet}
          amountToDeposit={amount}
          chainId={chainId}
          approveTx={approveTransaction}
          sendApproveTx={sendApproveTx}
        />
      </>
    )
  } else if (transaction?.status === TransactionStatus.error) {
    return (
      <>
        <p className='mt-8 mb-2 text-accent-1 text-center mx-8'>😔 {t('ohNo', 'Oh no')}!</p>
        <p className='mb-8 text-accent-1 text-center mx-8'>
          {t(
            'somethingWentWrongWhileProcessingYourTransaction',
            'Something went wrong while processing your transaction.'
          )}
        </p>
        {transaction && (
          <TransactionReceiptButton className='w-full mb-2' chainId={chainId} tx={transaction} />
        )}
        <Button
          theme={ButtonTheme.tealOutline}
          className='w-full'
          onClick={() => {
            previous()
            clearTransaction()
          }}
        >
          {t('tryAgain', 'Try again')}
        </Button>
      </>
    )
  } else if (
    transaction?.status === TransactionStatus.pendingBlockchainConfirmation ||
    transaction?.status === TransactionStatus.success
  ) {
    return (
      <>
        {!!successView && <div className='mb-4'>{successView}</div>}
        <TransactionReceiptButton className='w-full' chainId={chainId} tx={transaction} />
      </>
    )
  }

  return (
    <>
      {!!reviewView && <div className='mb-4'>{reviewView}</div>}
      <TxButton
        className='w-full'
        chainId={chainId}
        onClick={sendTransaction}
        state={transaction?.state}
        status={transaction?.status}
        radius={ButtonRadius.full}
        connectWallet={connectWallet}
      >
        {t(buttonTexti18nKey)}
      </TxButton>
      <div className='mt-4'>
        <TransactionTosDisclaimer buttonTexti18nKey={buttonTexti18nKey} />
      </div>
    </>
  )
}

ReviewTransactionView.defaultProps = {
  buttonTexti18nKey: 'confirmTransaction'
}
