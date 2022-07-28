import { ModalWithViewState, ModalWithViewStateView } from '@pooltogether/react-components'
import { useCallback, useState } from 'react'
import { TransactionState, useTransaction } from '@pooltogether/wallet-connection'
import { useSelectedPrizePoolTokens } from '@hooks/v4/PrizePool/useSelectedPrizePoolTokens'
import { Amount } from '@pooltogether/hooks'
import { useSelectedChainId } from '@hooks/useSelectedChainId'
import { DepositReviewView } from '@components/ModalViews/DepositReviewView'
import { ExplorePrizePoolsView } from '@components/ModalViews/ExplorePrizePoolsView'
import { DepositView } from '@views/Deposit/DepositModal/DepositView'
import { useSendDepositTransaction } from '@hooks/v4/PrizePool/useSendDepositTransaction'
import { WalletConnectionView } from '@components/ModalViews/WalletConnectionView'

export enum ViewIds {
  explore,
  deposit,
  depositReview,
  walletConnection
}

export const ExplorePrizePoolsModal: React.FC<{
  isOpen: boolean
  closeModal: () => void
}> = (props) => {
  const { isOpen, closeModal: _closeModal } = props
  const [selectedViewId, setSelectedViewId] = useState<string | number>(ViewIds.explore)
  const [depositAmount, setDepositAmount] = useState<Amount>()
  const { chainId } = useSelectedChainId()
  const { data: tokenData } = useSelectedPrizePoolTokens()
  const [depositTransactionId, setDepositTransactionId] = useState('')
  const depositTransaction = useTransaction(depositTransactionId)

  /**
   * Submit the transaction to deposit and store the transaction id in state
   */
  const sendDepositransaction = useSendDepositTransaction(depositAmount)

  const closeModal = useCallback(() => {
    if (depositTransaction?.state === TransactionState.complete) {
      setDepositTransactionId('')
    }
    setSelectedViewId(ViewIds.explore)
    _closeModal()
  }, [depositTransaction?.state])

  const views: ModalWithViewStateView[] = [
    {
      id: ViewIds.explore,
      view: ExplorePrizePoolsView,
      title: 'Select a prize pool',
      nextViewId: ViewIds.deposit,
      hideNextNavButton: true
    },
    {
      id: ViewIds.deposit,
      view: DepositView,
      title: 'Deposit in a Prize Pool',
      previousViewId: ViewIds.explore,
      onCloseViewId: ViewIds.explore
    },
    {
      id: ViewIds.depositReview,
      view: DepositReviewView,
      title: 'Deposit review',
      previousViewId: ViewIds.deposit,
      onCloseViewId: ViewIds.explore
    },
    {
      id: ViewIds.walletConnection,
      view: WalletConnectionView,
      previousViewId: ViewIds.deposit,
      title: 'Connect a wallet',
      bgClassName: 'bg-new-modal',
      onCloseViewId: ViewIds.explore
    }
  ]

  return (
    <ModalWithViewState
      label='explore-prize-pools-modal'
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
      onWalletConnected={() => setSelectedViewId(ViewIds.deposit)}
      // DepositView
      token={tokenData?.token}
      depositTransaction={depositTransaction}
      setDepositAmount={setDepositAmount}
      clearDepositTransaction={() => setDepositTransactionId('')}
      // DepositReviewView
      depositAmount={depositAmount}
      sendDepositransaction={() => setDepositTransactionId(sendDepositransaction())}
    />
  )
}
