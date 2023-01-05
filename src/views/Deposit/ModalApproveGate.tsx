import { ModalInfoList } from '@components/InfoList'
import { EstimatedDepositGasItems } from '@components/InfoList/EstimatedGasItem'
import { TxButton } from '@components/Input/TxButton'
import { SUPPORTED_EIP2612_PRIZE_POOL_IDS } from '@constants/config'
import { useGetUser } from '@hooks/v4/User/useGetUser'
import { Amount, useTokenAllowance } from '@pooltogether/hooks'
import {
  ButtonLink,
  ButtonTheme,
  ThemedClipSpinner,
  ButtonRadius
} from '@pooltogether/react-components'
import { PrizePool } from '@pooltogether/v4-client-js'
import {
  formatBlockExplorerTxUrl,
  TransactionState,
  TransactionStatus,
  useApproveErc20,
  useTransaction,
  useUsersAddress
} from '@pooltogether/wallet-connection'
import { DepositLowAmountWarning } from '@views/DepositLowAmountWarning'
import classNames from 'classnames'
import { useState } from 'react'
import { useTranslation } from 'react-i18next'

interface ModalApproveGateProps {
  className?: string
  amountToDeposit?: Amount
  chainId: number
  connectWallet?: () => void
  spenderAddress: string
  tokenAddress: string
  prizePool: PrizePool
}

type ApprovalType = 'eip2612' | 'infinite' | 'simple'

/**
 * @param props
 * @returns
 */
export const ModalApproveGate = (props: ModalApproveGateProps) => {
  const {
    className,
    amountToDeposit,
    chainId,
    connectWallet,
    spenderAddress,
    tokenAddress,
    prizePool
  } = props
  const usersAddress = useUsersAddress()
  const { refetch: refetchTokenAllowance } = useTokenAllowance(
    chainId,
    usersAddress,
    spenderAddress,
    tokenAddress
  )
  const supportsEIP2612 = SUPPORTED_EIP2612_PRIZE_POOL_IDS.includes(prizePool.id())
  const defaultApprovalType: ApprovalType = supportsEIP2612 ? 'eip2612' : 'infinite'
  const [approvalType, setApprovalType] = useState<ApprovalType>(defaultApprovalType)
  const [approveTransactionId, setApproveTransactionId] = useState('')
  const [signatureApprovalStatus, setSignatureApprovalStatus] = useState<
    TransactionStatus | undefined
  >(undefined)
  const approveTransaction = useTransaction(approveTransactionId)
  const _sendInfiniteApproveTx = useApproveErc20(tokenAddress, spenderAddress, {
    callbacks: { onSuccess: () => refetchTokenAllowance() }
  })
  const _sendApproveTx = useApproveErc20(
    tokenAddress,
    spenderAddress,
    {
      callbacks: { onSuccess: () => refetchTokenAllowance() }
    },
    amountToDeposit.amountUnformatted
  )
  const getUser = useGetUser(prizePool)
  const { t } = useTranslation()

  // TODO: send signatures to deposit view to build transaction with permits

  const approveDeposit = async () => {
    if (approvalType === 'eip2612') {
      setSignatureApprovalStatus(TransactionStatus.pendingUserConfirmation)
      const user = await getUser()
      try {
        const depositSignature = await user.getPermitAndDepositSignaturePromise(
          amountToDeposit.amountUnformatted
        )
        const delegationSignature = await user.getPermitAndDelegateSignaturePromise(
          amountToDeposit.amountUnformatted
        )
        setSignatureApprovalStatus(TransactionStatus.success)
      } catch {
        setSignatureApprovalStatus(TransactionStatus.error)
      }
    } else if (approvalType === 'infinite') {
      const transactionId = await _sendInfiniteApproveTx()
      setApproveTransactionId(transactionId)
    } else if (approvalType === 'simple') {
      const transactionId = await _sendApproveTx()
      setApproveTransactionId(transactionId)
    }
  }

  if (approveTransaction?.state === TransactionState.pending) {
    const blockExplorerUrl = formatBlockExplorerTxUrl(approveTransaction.response?.hash, chainId)

    return (
      <div className={classNames(className, 'flex flex-col')}>
        <ThemedClipSpinner className='mx-auto mb-8' sizeClassName='w-10 h-10' />
        <div className='text-inverse opacity-60'>
          <p className='mb-4 text-center mx-8'>
            {t(
              'onceYourApprovalTxHasFinished',
              'Once your approval transaction has finished successfully you can deposit.'
            )}
          </p>
        </div>
        <ButtonLink
          href={blockExplorerUrl}
          className='w-full mt-6'
          theme={ButtonTheme.tealOutline}
          target='_blank'
          rel='noreferrer'
        >
          {t('viewReceipt', 'View receipt')}
        </ButtonLink>
      </div>
    )
  }

  return (
    <div className={classNames(className, 'flex flex-col')}>
      {/* TODO: add general info on approvals */}
      {/* TODO: add tabs for different approval types (only show eip2612 for specific pools) */}
      {/* TODO: add information for each type (sigs cannot be used on multisig/sc wallets, etc.) */}
      <div className='mx-4 text-inverse opacity-60'>
        <p className='mb-4'>
          {t(
            'prizePoolContractsRequireApprovals',
            `PoolTogether's Prize Pool contracts require you to send an approval transaction before depositing.`
          )}
        </p>
        <p className='mb-4'>{t('thisIsOncePerNetworkIfInfinite')}</p>
        <p className='mb-10'>
          {t('forMoreInfoOnApprovals', `For more info on approvals see:`)}{' '}
          <a
            target='_blank'
            rel='noreferrer'
            className='underline'
            href='https://docs.pooltogether.com/how-to/how-to-deposit'
          >
            {t('howToDeposit', 'How to deposit')}
          </a>
          .
        </p>
      </div>
      <ModalInfoList className='mb-2'>
        <EstimatedDepositGasItems chainId={chainId} showApprove />
      </ModalInfoList>
      <div className='mb-6'>
        <DepositLowAmountWarning chainId={chainId} amountToDeposit={amountToDeposit} />
      </div>
      <TxButton
        className='w-full'
        radius={ButtonRadius.full}
        chainId={chainId}
        onClick={approveDeposit}
        state={approveTransaction?.state}
        status={approvalType === 'eip2612' ? signatureApprovalStatus : approveTransaction?.status}
        connectWallet={connectWallet}
      >
        {/* TODO: change button text based on type selection */}
        {t('confirmApproval', 'Confirm approval')}
      </TxButton>
    </div>
  )
}
