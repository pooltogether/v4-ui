import { useSelectedChainId } from '@hooks/useSelectedChainId'
import { useSendDepositTransaction } from '@hooks/v4/PrizePool/useSendDepositTransaction'
import { Amount } from '@pooltogether/hooks'
import { ModalWithViewState, ModalWithViewStateView } from '@pooltogether/react-components'
import { PrizePool } from '@pooltogether/v4-client-js'
import { useTransaction } from '@pooltogether/wallet-connection'
import { useCallback, useState } from 'react'
import { ExplorePrizePoolsView } from '../../../../components/ModalViews/ExplorePrizePoolsView'
import { WalletConnectionView } from '../../../../components/ModalViews/WalletConnectionView'
import { DepositReviewView } from './DepositReviewView'
import { DepositView } from './DepositView'

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
      // title: 'Select a prize pool',
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
      noAnimation
      label='deposit-modal'
      bgClassName='bg-gradient-to-br from-pt-purple-lightest to-pt-purple-lighter dark:from-gradient-purple dark:to-pt-purple'
      modalHeightClassName='h-actually-full-screen min-h-1/2 xs:h-auto'
      maxHeightClassName='max-h-screen xs:max-h-90-screen'
      maxWidthClassName='xs:max-w-screen-xs sm:max-w-screen-sm md:max-w-screen-md'
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
