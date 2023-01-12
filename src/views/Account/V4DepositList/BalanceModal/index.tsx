import { DepositReviewViewCore } from '@components/ModalViews/DepositReviewViewCore'
import { WalletConnectionView } from '@components/ModalViews/WalletConnectionView'
import { WithdrawReviewView } from '@components/ModalViews/WithdrawReviewView'
import { SUPPORTED_EIP2612_PRIZE_POOL_IDS } from '@constants/config'
import { useSelectedChainId } from '@hooks/useSelectedChainId'
import { useSelectedPrizePool } from '@hooks/v4/PrizePool/useSelectedPrizePool'
import { useSelectedPrizePoolTokens } from '@hooks/v4/PrizePool/useSelectedPrizePoolTokens'
import { useSendDepositTransaction } from '@hooks/v4/PrizePool/useSendDepositTransaction'
import { useSendWithdrawTransaction } from '@hooks/v4/PrizePool/useSendWithdrawTransaction'
import { Amount } from '@pooltogether/hooks'
import { BottomSheetWithViewState, ModalWithViewStateView } from '@pooltogether/react-components'
import { ERC2612PermitMessage, ERC2612TicketPermitMessage } from '@pooltogether/v4-client-js'
import {
  getChainNameByChainId,
  TransactionState,
  useTransaction
} from '@pooltogether/wallet-connection'
import { ApprovalType } from '@views/Deposit/DepositTrigger/DepositModal'
import { RSV } from 'eth-permit/dist/rpc'
import { useTranslation } from 'next-i18next'
import { useCallback, useEffect, useState } from 'react'
import { PrizePoolInfoView } from '../../../../components/ModalViews/PrizePoolInfoView'
import { DelegateView } from '../DelegateView'
import { DepositView } from './DepositView'
import { MainView } from './MainView'
import { WithdrawView } from './WithdrawView'

export enum ViewIds {
  main,
  deposit,
  depositReview,
  withdraw,
  withdrawReview,
  moreInfo,
  delegate,
  walletConnection
}

export const BalanceModal: React.FC<{
  isOpen: boolean
  closeModal: () => void
}> = (props) => {
  const { isOpen, closeModal: _closeModal } = props
  const [depositAmount, setDepositAmount] = useState<Amount>()
  const [formAmount, setFormAmount] = useState<string>()
  const [withdrawAmount, setWithdrawAmount] = useState<Amount>()
  const { chainId } = useSelectedChainId()
  const { data: tokenData } = useSelectedPrizePoolTokens()
  const [depositTransactionId, setDepositTransactionId] = useState('')
  const [withdrawTransactionId, setWithdrawTransactionId] = useState('')
  const depositTransaction = useTransaction(depositTransactionId)
  const withdrawTransaction = useTransaction(withdrawTransactionId)
  const [viewId, setViewId] = useState<string | number>(ViewIds.main)
  const prizePool = useSelectedPrizePool()
  const { t } = useTranslation()

  const defaultApprovalType: ApprovalType = SUPPORTED_EIP2612_PRIZE_POOL_IDS.includes(
    prizePool.id()
  )
    ? 'eip2612'
    : 'infinite'
  const [approvalType, setApprovalType] = useState<ApprovalType>(defaultApprovalType)
  const [eip2612DepositPermit, setEip2612DepositPermit] = useState<ERC2612PermitMessage & RSV>()
  const [eip2612DelegationPermit, setEip2612DelegationPermit] = useState<
    ERC2612TicketPermitMessage & RSV
  >()
  useEffect(() => {
    setApprovalType(defaultApprovalType)
  }, [defaultApprovalType])

  /**
   * Submit the transaction to deposit and store the transaction id in state
   */
  const _sendDepositTransaction = useSendDepositTransaction(
    depositAmount,
    approvalType === 'eip2612'
      ? {
          depositPermit: eip2612DepositPermit,
          delegationPermit: eip2612DelegationPermit
        }
      : undefined
  )
  const sendDepositTransaction = useCallback(
    () => setDepositTransactionId(_sendDepositTransaction()),
    [_sendDepositTransaction]
  )

  const sendWithdrawTransaction = useSendWithdrawTransaction(withdrawAmount)

  const views: ModalWithViewStateView[] = [
    {
      id: ViewIds.main,
      view: MainView
    },
    {
      id: ViewIds.deposit,
      view: DepositView,
      header: t('deposit'),
      previousViewId: ViewIds.main,
      onCloseViewId: ViewIds.main
    },
    {
      id: ViewIds.depositReview,
      view: DepositReviewViewCore,
      header: t('depositReview'),
      previousViewId: ViewIds.deposit,
      onCloseViewId: ViewIds.main
    },
    {
      id: ViewIds.withdraw,
      view: WithdrawView,
      header: t('withdraw'),
      previousViewId: ViewIds.main,
      onCloseViewId: ViewIds.main
    },
    {
      id: ViewIds.withdrawReview,
      view: WithdrawReviewView,
      header: t('withdrawReview'),
      previousViewId: ViewIds.withdraw,
      onCloseViewId: ViewIds.main
    },
    {
      id: ViewIds.moreInfo,
      view: PrizePoolInfoView,
      header: t('moreInfo'),
      previousViewId: ViewIds.main,
      onCloseViewId: ViewIds.main
    },
    {
      id: ViewIds.delegate,
      view: DelegateView,
      header: '',
      previousViewId: ViewIds.main,
      onCloseViewId: ViewIds.main
    },
    {
      id: ViewIds.walletConnection,
      view: WalletConnectionView,
      previousViewId: ViewIds.deposit,
      header: t('connectAWallet'),
      onCloseViewId: ViewIds.main
    }
  ]

  const closeModal = useCallback(async () => {
    if (depositTransaction?.state === TransactionState.complete) {
      setDepositTransactionId('')
    }
    _closeModal()
  }, [depositTransaction?.state])

  return (
    <BottomSheetWithViewState
      header={`${tokenData?.token.symbol} deposits on ${getChainNameByChainId(chainId)}`}
      label='balance-modal'
      modalHeightClassName='h-actually-full-screen xs:h-auto min-h-1/2'
      widthClassName='w-screen xs:w-full'
      roundedClassName='rounded-none xs:rounded-xl'
      className='h-full'
      isOpen={isOpen}
      closeModal={closeModal}
      viewIds={ViewIds}
      views={views}
      selectedViewId={viewId}
      setSelectedViewId={setViewId}
      // View props
      chainId={chainId}
      // WalletConnectionModalView
      onWalletConnected={(viewId) => setViewId(ViewIds.main)}
      // DepositView
      token={tokenData?.token}
      depositTransaction={depositTransaction}
      setDepositAmount={setDepositAmount}
      formAmount={formAmount}
      setFormAmount={setFormAmount}
      clearDepositTransaction={() => setDepositTransactionId('')}
      // DepositReviewViewCore
      depositAmount={depositAmount}
      sendDepositTransaction={sendDepositTransaction}
      // reviewView
      approvalType={approvalType}
      setApprovalType={setApprovalType}
      eip2612DepositPermit={eip2612DepositPermit}
      eip2612DelegationPermit={eip2612DelegationPermit}
      setEip2612DepositPermit={setEip2612DepositPermit}
      setEip2612DelegationPermit={setEip2612DelegationPermit}
      // WithdrawView
      withdrawTransaction={withdrawTransaction}
      setWithdrawAmount={setWithdrawAmount}
      clearWithdrawTransaction={() => setWithdrawTransactionId('')}
      // WithdrawReviewView
      withdrawAmount={withdrawAmount}
      sendWithdrawTransaction={() => setWithdrawTransactionId(sendWithdrawTransaction())}
    />
  )
}
