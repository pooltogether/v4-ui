import { ModalWithViewState, ModalWithViewStateView } from '@pooltogether/react-components'
import { useCallback, useState } from 'react'
import {
  getChainNameByChainId,
  TransactionState,
  useTransaction
} from '@pooltogether/wallet-connection'
import { useSelectedPrizePoolTokens } from '@hooks/v4/PrizePool/useSelectedPrizePoolTokens'
import { Amount } from '@pooltogether/hooks'
import { useSelectedChainId } from '@hooks/useSelectedChainId'
import { MainView } from './MainView'
import { DepositView } from './DepositView'
import { WithdrawView } from './WithdrawView'
import { PrizePoolInfoView } from '../../../../components/ModalViews/PrizePoolInfoView'
import { DepositReviewView } from '@components/ModalViews/DepositReviewView'
import { WithdrawReviewView } from '@components/ModalViews/WithdrawReviewView'
import { useSendDepositTransaction } from '@hooks/v4/PrizePool/useSendDepositTransaction'
import { useSendWithdrawTransaction } from '@hooks/v4/PrizePool/useSendWithdrawTransaction'
import { WalletConnectionView } from '@components/ModalViews/WalletConnectionView'

export enum ViewIds {
  main,
  deposit,
  depositReview,
  withdraw,
  withdrawReview,
  moreInfo,
  walletConnection
}

const views: ModalWithViewStateView[] = [
  {
    id: ViewIds.main,
    view: MainView
  },
  {
    id: ViewIds.deposit,
    view: DepositView,
    title: 'Deposit',
    previousViewId: ViewIds.main
  },
  {
    id: ViewIds.depositReview,
    view: DepositReviewView,
    title: 'Deposit review',
    previousViewId: ViewIds.deposit
  },
  {
    id: ViewIds.withdraw,
    view: WithdrawView,
    title: 'Withdraw',
    previousViewId: ViewIds.main,
    bgClassName: 'bg-pt-purple-light dark:bg-pt-purple-dark'
  },
  {
    id: ViewIds.withdrawReview,
    view: WithdrawReviewView,
    title: 'Withdraw review',
    previousViewId: ViewIds.withdraw,
    bgClassName: 'bg-pt-purple-lighter dark:bg-pt-purple-darker'
  },
  {
    id: ViewIds.moreInfo,
    view: PrizePoolInfoView,
    title: 'More info',
    previousViewId: ViewIds.main
  },
  {
    id: ViewIds.walletConnection,
    view: WalletConnectionView,
    previousViewId: ViewIds.deposit,
    title: 'Connect a wallet',
    bgClassName: 'bg-new-modal',
    onCloseViewId: ViewIds.main
  }
]

export const BalanceModal: React.FC<{
  isOpen: boolean
  closeModal: () => void
}> = (props) => {
  const { isOpen, closeModal: _closeModal } = props
  const [selectedViewId, setSelectedViewId] = useState<string | number>(ViewIds.main)
  const [depositAmount, setDepositAmount] = useState<Amount>()
  const [withdrawAmount, setWithdrawAmount] = useState<Amount>()
  const { chainId } = useSelectedChainId()
  const { data: tokenData } = useSelectedPrizePoolTokens()
  const [depositTransactionId, setDepositTransactionId] = useState('')
  const [withdrawTransactionId, setWithdrawTransactionId] = useState('')
  const depositTransaction = useTransaction(depositTransactionId)
  const withdrawTransaction = useTransaction(withdrawTransactionId)

  const sendDepositTransaction = useSendDepositTransaction(depositAmount)
  const sendWithdrawTransaction = useSendWithdrawTransaction(withdrawAmount)

  const closeModal = useCallback(() => {
    if (depositTransaction?.state === TransactionState.complete) {
      setDepositTransactionId('')
    }
    setSelectedViewId(ViewIds.main)
    _closeModal()
  }, [depositTransaction?.state])

  return (
    <ModalWithViewState
      title={`${tokenData?.token.symbol} deposits on ${getChainNameByChainId(chainId)}`}
      label='balance-modal'
      bgClassName='bg-gradient-to-br from-white to-gradient-purple dark:from-gradient-purple dark:to-gradient-pink'
      isOpen={isOpen}
      closeModal={closeModal}
      viewIds={ViewIds}
      views={views}
      selectedViewId={selectedViewId}
      setSelectedViewId={setSelectedViewId}
      // View props
      // BridgeTokensModalView
      chainId={chainId}
      // TODO: This is needed pretty much everywhere...
      // WalletConnectionModalView
      onWalletConnected={() => setSelectedViewId(ViewIds.main)}
      // DepositView
      token={tokenData?.token}
      depositTransaction={depositTransaction}
      setDepositAmount={setDepositAmount}
      clearDepositTransaction={() => setDepositTransactionId('')}
      // DepositReviewView
      depositAmount={depositAmount}
      sendDepositTransaction={() => setDepositTransactionId(sendDepositTransaction())}
      // WithdrawView
      withdrawTransaction={withdrawTransaction}
      setWithdrawAmount={setWithdrawAmount}
      clearWithdrawTransaction={() => setDepositTransactionId('')}
      // WithdrawReviewView
      withdrawAmount={withdrawAmount}
      sendWithdrawTransaction={() => setWithdrawTransactionId(sendWithdrawTransaction())}
    />
  )
}
