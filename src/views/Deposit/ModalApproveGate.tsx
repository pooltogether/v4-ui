import { ModalInfoList } from '@components/InfoList'
import { EstimatedDepositGasItems } from '@components/InfoList/EstimatedGasItem'
import { TxButton } from '@components/Input/TxButton'
import { Amount, useTokenAllowance } from '@pooltogether/hooks'
import {
  ButtonLink,
  ButtonTheme,
  ThemedClipSpinner,
  ButtonRadius,
  CheckboxInputGroup
} from '@pooltogether/react-components'
import {
  formatBlockExplorerTxUrl,
  TransactionState,
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
}

/**
 * @param props
 * @returns
 */
export const ModalApproveGate = (props: ModalApproveGateProps) => {
  const { className, amountToDeposit, chainId, connectWallet, spenderAddress, tokenAddress } = props
  const usersAddress = useUsersAddress()
  const { refetch: refetchTokenAllowance } = useTokenAllowance(
    chainId,
    usersAddress,
    spenderAddress,
    tokenAddress
  )
  const [isInfiniteApproval, setIsInfiniteApproval] = useState(true)
  const [approveTransactionId, setApproveTransactionId] = useState('')
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
  const { t } = useTranslation()

  const sendApproveTx = async () => {
    const transactionId = await (isInfiniteApproval ? _sendInfiniteApproveTx() : _sendApproveTx())
    setApproveTransactionId(transactionId)
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
        onClick={sendApproveTx}
        state={approveTransaction?.state}
        status={approveTransaction?.status}
        connectWallet={connectWallet}
      >
        {t('confirmApproval', 'Confirm approval')}
      </TxButton>
      <div className='flex justify-end mt-2 mr-2 text-xxs'>
        <CheckboxInputGroup
          large
          id='infinite-approval-toggle'
          name='infinite-approval-toggle'
          label={t('infiniteApproval')}
          checked={isInfiniteApproval}
          handleClick={() => {
            setIsInfiniteApproval(!isInfiniteApproval)
          }}
        />
      </div>
    </div>
  )
}
