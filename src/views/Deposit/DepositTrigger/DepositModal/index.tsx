import { ModalWithViewState, ModalWithViewStateView } from '@pooltogether/react-components'
import { useCallback, useState } from 'react'
import { ExplorePrizePoolsView } from '../../../../components/ModalViews/ExplorePrizePoolsView'
import { WalletConnectionView } from '../../../../components/ModalViews/WalletConnectionView'
import { DepositView } from './DepositView'
import { useTransaction } from '@pooltogether/wallet-connection'
import { Amount } from '@pooltogether/hooks'
import { DepositReviewView } from './DepositReviewView'
import { useSelectedChainId } from '@hooks/useSelectedChainId'
import { PrizePool } from '@pooltogether/v4-client-js'
import { useSendDepositTransaction } from '@hooks/v4/PrizePool/useSendDepositTransaction'

export enum ViewIds {
  deposit,
  explore,
  reviewTransaction,
  bridgeTokens,
  swapTokens,
  help,
  walletConnection
}

export const DepositModal: React.FC<{
  isOpen: boolean
  closeModal: () => void
  initialViewId?: ViewIds
}> = (props) => {
  const { isOpen, initialViewId, closeModal } = props
  const [selectedViewId, setSelectedViewId] = useState<string | number>(initialViewId)
  const [depositAmount, setDepositAmount] = useState<Amount>()
  const { chainId } = useSelectedChainId()
  const [depositTransactionId, setDepositTransactionId] = useState('')
  const depositTransaction = useTransaction(depositTransactionId)

  /**
   * Submit the transaction to deposit and store the transaction id in state
   */
  const _sendDepositTransaction = useSendDepositTransaction(depositAmount)
  const sendDepositTransaction = useCallback(
    () => setDepositTransactionId(_sendDepositTransaction()),
    [_sendDepositTransaction]
  )

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
      id: ViewIds.reviewTransaction,
      view: DepositReviewView,
      title: 'Deposit review',
      previousViewId: ViewIds.deposit,
      onCloseViewId: ViewIds.deposit
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

  const onPrizePoolSelect = (prizePool: PrizePool) => {
    setSelectedViewId(ViewIds.deposit)
  }

  return (
    <ModalWithViewState
      label='deposit-modal'
      bgClassName='bg-gradient-to-br from-pt-purple-lightest to-pt-purple-lighter dark:from-gradient-purple dark:to-pt-purple'
      modalHeightClassName='h-actually-full-screen min-h-1/2 sm:h-auto '
      maxHeightClassName='sm:max-h-90-screen'
      widthClassName='w-screen sm:w-full'
      maxWidthClassName='sm:max-w-screen-sm'
      roundedClassName='rounded-none sm:rounded-xl'
      className='h-full'
      isOpen={isOpen}
      closeModal={() => {
        setDepositTransactionId('')
        closeModal()
      }}
      viewIds={ViewIds}
      views={views}
      selectedViewId={selectedViewId}
      setSelectedViewId={setSelectedViewId}
      // ExploreView
      onPrizePoolSelect={onPrizePoolSelect}
      // BridgeTokensModalView
      chainId={chainId}
      // WalletConnectionModalView
      onWalletConnected={() => setSelectedViewId(ViewIds.deposit)}
      // DepositView
      depositTransaction={depositTransaction}
      depositAmount={depositAmount}
      setDepositAmount={setDepositAmount}
      // ReviewView
      sendDepositTransaction={sendDepositTransaction}
      clearDepositTransaction={() => setDepositTransactionId('')}
      connectWallet={() => setSelectedViewId(ViewIds.walletConnection)}
    />
  )
}

DepositModal.defaultProps = {
  initialViewId: ViewIds.explore
}
