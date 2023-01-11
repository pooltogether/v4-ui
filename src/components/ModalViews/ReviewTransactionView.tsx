import { TxButton } from '@components/Input/TxButton'
import { TransactionReceiptButton } from '@components/TransactionReceiptButton'
import { TransactionTosDisclaimer } from '@components/TransactionTosDisclaimer'
import { useSelectedChainId } from '@hooks/useSelectedChainId'
import { usePrizePoolTokens } from '@hooks/v4/PrizePool/usePrizePoolTokens'
import { useSelectedPrizePool } from '@hooks/v4/PrizePool/useSelectedPrizePool'
import { Amount, useTokenAllowance } from '@pooltogether/hooks'
import { Button, ButtonRadius, ButtonTheme, ViewProps } from '@pooltogether/react-components'
import { ERC2612PermitMessage, ERC2612TicketPermitMessage } from '@pooltogether/v4-client-js'
import { Transaction, TransactionStatus, useUsersAddress } from '@pooltogether/wallet-connection'
import { ApprovalType } from '@views/Deposit/DepositTrigger/DepositModal'
import { ModalApproveGate } from '@views/Deposit/ModalApproveGate'
import { ModalLoadingGate } from '@views/Deposit/ModalLoadingGate'
import { RSV } from 'eth-permit/dist/rpc'
import { BigNumber } from 'ethers'
import { useTranslation } from 'react-i18next'

export interface ReviewTransactionViewProps extends ViewProps {
  transaction: Transaction
  sendTransaction: () => void
  clearTransaction: () => void
  connectWallet: () => void
  isFetched?: boolean
  successView?: React.ReactNode
  reviewView?: React.ReactNode
  footerContent?: React.ReactNode
  spenderAddress?: string
  tokenAddress?: string
  amount?: Amount
  buttonTexti18nKey?: string
  approvalType: ApprovalType
  setApprovalType: (type: ApprovalType) => void
  eip2612DepositPermit?: ERC2612PermitMessage & RSV
  eip2612DelegationPermit?: ERC2612PermitMessage & RSV
  setEip2612DepositPermit?: (permit: ERC2612PermitMessage & RSV) => void
  setEip2612DelegationPermit?: (permit: ERC2612TicketPermitMessage & RSV) => void
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
    approvalType,
    setApprovalType,
    eip2612DepositPermit,
    eip2612DelegationPermit,
    setEip2612DepositPermit,
    setEip2612DelegationPermit
  } = props
  const { chainId } = useSelectedChainId()
  const prizePool = useSelectedPrizePool()
  const usersAddress = useUsersAddress()

  const {
    data: allowanceUnformatted,
    isFetched: isTokenAllowanceFetched,
    isIdle
  } = useTokenAllowance(chainId, usersAddress, spenderAddress, tokenAddress)
  const { isFetched: isTokensFetched } = usePrizePoolTokens(prizePool)
  const amountUnformatted = amount?.amountUnformatted

  const hasAllValidApprovalSignatures = () => {
    if (!!eip2612DepositPermit && !!eip2612DelegationPermit) {
      return (
        isValidApprovalSignature(eip2612DepositPermit) &&
        isValidApprovalSignature(eip2612DelegationPermit)
      )
    }
    return false
  }

  const isValidApprovalSignature = (
    signature: (ERC2612PermitMessage | ERC2612TicketPermitMessage) & RSV
  ) => {
    const timeNowInS = Date.now() / 1000
    if ('owner' in signature) {
      return (
        signature.owner.toLowerCase() === usersAddress.toLowerCase() &&
        signature.spender.toLowerCase() ===
          prizePool.eip2612PermitAndDepositMetadata.address.toLowerCase() &&
        BigNumber.from(signature.value).gte(amountUnformatted) &&
        Number(signature.deadline) >= timeNowInS + 20
      )
    } else {
      return (
        signature.user.toLowerCase() === usersAddress.toLowerCase() &&
        Number(signature.deadline) >= timeNowInS + 20
      )
    }
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
  } else if (
    !isIdle &&
    !!amountUnformatted &&
    allowanceUnformatted?.lt(amountUnformatted) &&
    !hasAllValidApprovalSignatures()
  ) {
    return (
      <>
        <ModalApproveGate
          connectWallet={connectWallet}
          amountToDeposit={amount}
          chainId={chainId}
          spenderAddress={spenderAddress}
          tokenAddress={tokenAddress}
          prizePool={prizePool}
          approvalType={approvalType}
          setApprovalType={setApprovalType}
          setEip2612DepositPermit={setEip2612DepositPermit}
          setEip2612DelegationPermit={setEip2612DelegationPermit}
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
