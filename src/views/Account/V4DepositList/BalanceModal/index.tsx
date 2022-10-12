import { DepositReviewView } from '@components/ModalViews/DepositReviewView'
import { WalletConnectionView } from '@components/ModalViews/WalletConnectionView'
import { WithdrawReviewView } from '@components/ModalViews/WithdrawReviewView'
import { useSelectedChainId } from '@hooks/useSelectedChainId'
import { useSelectedPrizePoolTokens } from '@hooks/v4/PrizePool/useSelectedPrizePoolTokens'
import { useSendDepositTransaction } from '@hooks/v4/PrizePool/useSendDepositTransaction'
import { useSendWithdrawTransaction } from '@hooks/v4/PrizePool/useSendWithdrawTransaction'
import { Amount, QUERY_KEYS } from '@pooltogether/hooks'
import { ModalWithViewState, ModalWithViewStateView } from '@pooltogether/react-components'
import {
  getChainNameByChainId,
  TransactionState,
  useTransaction
} from '@pooltogether/wallet-connection'
import { useRouter } from 'next/router'
import { useCallback, useEffect, useState } from 'react'
import { PrizePoolInfoView } from '../../../../components/ModalViews/PrizePoolInfoView'
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
  walletConnection
}

export const BalanceModal: React.FC<{
  isOpen: boolean
  closeModal: () => void
}> = (props) => {
  const { isOpen, closeModal: _closeModal } = props
  const [depositAmount, setDepositAmount] = useState<Amount>()
  const [withdrawAmount, setWithdrawAmount] = useState<Amount>()
  const { chainId } = useSelectedChainId()
  const { data: tokenData } = useSelectedPrizePoolTokens()
  const [depositTransactionId, setDepositTransactionId] = useState('')
  const [withdrawTransactionId, setWithdrawTransactionId] = useState('')
  const depositTransaction = useTransaction(depositTransactionId)
  const withdrawTransaction = useTransaction(withdrawTransactionId)
  const [viewId, setViewId] = useState<string | number>(ViewIds.main)

  const sendDepositTransaction = useSendDepositTransaction(depositAmount)
  const sendWithdrawTransaction = useSendWithdrawTransaction(withdrawAmount)

  const views: ModalWithViewStateView[] = [
    {
      id: ViewIds.main,
      view: MainView
    },
    {
      id: ViewIds.deposit,
      view: DepositView,
      title: 'Deposit',
      previousViewId: ViewIds.main,
      bgClassName: 'bg-pt-purple-lightest dark:bg-gradient-purple'
    },
    {
      id: ViewIds.depositReview,
      view: DepositReviewView,
      title: 'Deposit review',
      previousViewId: ViewIds.deposit,
      bgClassName: 'bg-pt-purple-lightest dark:bg-gradient-purple'
    },
    {
      id: ViewIds.withdraw,
      view: WithdrawView,
      title: 'Withdraw',
      previousViewId: ViewIds.main,
      bgClassName: 'bg-pt-purple-lighter dark:bg-pt-purple-darker'
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

  const closeModal = useCallback(async () => {
    if (depositTransaction?.state === TransactionState.complete) {
      setDepositTransactionId('')
    }
    _closeModal()
  }, [depositTransaction?.state])

  return (
    <ModalWithViewState
      noAnimation
      title={`${tokenData?.token.symbol} deposits on ${getChainNameByChainId(chainId)}`}
      label='balance-modal'
      bgClassName='bg-gradient-to-b from-pt-purple-lightest to-pt-purple-lighter dark:from-gradient-purple dark:to-pt-purple-darker'
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
