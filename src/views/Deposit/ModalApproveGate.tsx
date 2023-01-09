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
  ButtonRadius,
  Tabs,
  Tab
} from '@pooltogether/react-components'
import { ERC2612PermitMessage, PrizePool } from '@pooltogether/v4-client-js'
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
import { RSV } from 'eth-permit/dist/rpc'
import { useState } from 'react'
import { useTranslation } from 'react-i18next'
import { ApprovalType } from './DepositTrigger/DepositModal'

interface ModalApproveGateProps {
  className?: string
  amountToDeposit?: Amount
  chainId: number
  connectWallet?: () => void
  spenderAddress: string
  tokenAddress: string
  prizePool: PrizePool
  approvalType: ApprovalType
  setApprovalType: (type: ApprovalType) => void
  setEip2612DepositPermit?: (permit: ERC2612PermitMessage & RSV) => void
  setEip2612DelegationPermit?: (permit: ERC2612PermitMessage & RSV) => void
}

interface ApprovalTypeTab extends Tab {
  id: ApprovalType
}

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
    prizePool,
    approvalType,
    setApprovalType,
    setEip2612DepositPermit,
    setEip2612DelegationPermit
  } = props
  const usersAddress = useUsersAddress()
  const { refetch: refetchTokenAllowance } = useTokenAllowance(
    chainId,
    usersAddress,
    spenderAddress,
    tokenAddress
  )
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

  const approveDeposit = async () => {
    if (approvalType === 'eip2612') {
      setSignatureApprovalStatus(TransactionStatus.pendingUserConfirmation)
      const user = await getUser()
      try {
        const depositSignature = await user.getPermitAndDepositSignaturePromise(
          amountToDeposit.amountUnformatted
        )
        setEip2612DepositPermit(depositSignature)
        const delegationSignature = await user.getPermitAndDelegateSignaturePromise(
          amountToDeposit.amountUnformatted
        )
        setEip2612DelegationPermit(delegationSignature)
        setSignatureApprovalStatus(TransactionStatus.success)
      } catch {
        setSignatureApprovalStatus(TransactionStatus.error)
      }
    } else if (approvalType === 'infinite') {
      const transactionId = await _sendInfiniteApproveTx()
      setApproveTransactionId(transactionId)
    } else if (approvalType === 'exact') {
      const transactionId = await _sendApproveTx()
      setApproveTransactionId(transactionId)
    }
  }

  // TODO: localization
  const approvalTypeTabs: ApprovalTypeTab[] = [
    {
      id: 'eip2612',
      view: <ApprovalInfo type='eip2612' />,
      title: 'Signature'
    },
    {
      id: 'infinite',
      view: <ApprovalInfo type='infinite' />,
      title: 'Infinite'
    },
    {
      id: 'exact',
      view: <ApprovalInfo type='exact' />,
      title: 'Exact'
    }
  ]
  if (!SUPPORTED_EIP2612_PRIZE_POOL_IDS.includes(prizePool.id())) {
    approvalTypeTabs.shift()
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
        <p className='mb-6'>
          {t(
            'prizePoolContractsRequireApprovals',
            `PoolTogether's Prize Pool contracts require you to send an approval transaction before depositing.`
          )}
        </p>
      </div>
      <div className='mb-4 bg-white bg-opacity-20 dark:bg-actually-black dark:bg-opacity-10 rounded-lg'>
        <h6 className='mx-4 mt-4'>Choose your approval method:</h6>
        <Tabs
          titleClassName='p-4'
          initialTabId={approvalType}
          onTabSelect={(tab) => setApprovalType(tab.id as ApprovalType)}
          tabs={approvalTypeTabs}
        />
      </div>
      <div className='mx-4 text-inverse opacity-60'>
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
        <EstimatedDepositGasItems chainId={chainId} showApprove={approvalType !== 'eip2612'} />
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
        {/* TODO: localization */}
        {approvalType === 'eip2612' ? 'Sign approval' : t('confirmApproval')}
      </TxButton>
    </div>
  )
}

const ApprovalInfo = (props: { type: ApprovalType }) => {
  const { type } = props
  const { t } = useTranslation()

  // TODO: localization
  const content: Record<ApprovalType, string[]> = {
    eip2612: [
      'Through EIP 2612 signatures, you are able to approve your deposit without paying gas fees!',
      'Keep in mind this cannot be used with multisigs or smart contract wallets.'
    ],
    infinite: [
      'By sending an infinite approval, you will not need to send another approval transaction on your next deposit.'
    ],
    exact: [
      'An exact approval transaction will only approve your exact deposit amount for transacting.'
    ]
  }

  return (
    <div className='mx-4 text-inverse opacity-60'>
      {content[type].map((text) => {
        return <p className='mb-4'>{text}</p>
      })}
    </div>
  )
}
