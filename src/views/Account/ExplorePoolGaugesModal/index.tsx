import { ModalWithViewState, ModalWithViewStateView } from '@pooltogether/react-components'
import { useCallback, useState } from 'react'
import { TransactionState, useTransaction } from '@pooltogether/wallet-connection'
import { useSelectedPrizePoolTokens } from '@hooks/v4/PrizePool/useSelectedPrizePoolTokens'
import { Amount } from '@pooltogether/hooks'
import { useSelectedChainId } from '@hooks/useSelectedChainId'
import { ExplorePoolGaugesView } from '@components/ModalViews/ExplorePoolGaugesView'
import { WalletConnectionView } from '@components/ModalViews/WalletConnectionView'
import { StakeView } from './StakeView'
import { StakeReviewView } from './StakeReviewView'
import { useSendStakeTransaction } from '@hooks/v4/Gauge/useSendStakeTransaction'
import { useSendUnstakeTransaction } from '@hooks/v4/Gauge/useSendUnstakeTransaction'
import { GaugeView } from '@components/ModalViews/GaugeView'
import { GaugeInfoView } from '@components/ModalViews/GaugeInfoView'
import { UnstakeView } from './UnstakeView'
import { UnstakeReviewView } from './UnstakeReviewView'

export enum ViewIds {
  explore,
  gauge,
  stake,
  stakeReview,
  unstake,
  unstakeReview,
  walletConnection,
  moreInfo
}

const views: ModalWithViewStateView[] = [
  {
    id: ViewIds.explore,
    view: ExplorePoolGaugesView,
    title: 'Select a gauge',
    nextViewId: ViewIds.gauge,
    hideNextNavButton: true
  },
  {
    id: ViewIds.gauge,
    view: GaugeView,
    title: 'Prize Pool Gauge',
    previousViewId: ViewIds.explore,
    onCloseViewId: ViewIds.explore
  },
  {
    id: ViewIds.stake,
    view: StakeView,
    title: 'Stake in a Prize Pool Gauge',
    previousViewId: ViewIds.gauge,
    onCloseViewId: ViewIds.explore
  },
  {
    id: ViewIds.stakeReview,
    view: StakeReviewView,
    title: 'Stake review',
    previousViewId: ViewIds.stake,
    onCloseViewId: ViewIds.explore
  },
  {
    id: ViewIds.unstake,
    view: UnstakeView,
    title: 'Unstake in a Prize Pool Gauge',
    previousViewId: ViewIds.gauge,
    onCloseViewId: ViewIds.explore
  },
  {
    id: ViewIds.unstakeReview,
    view: UnstakeReviewView,
    title: 'Unstake review',
    previousViewId: ViewIds.unstake,
    onCloseViewId: ViewIds.explore
  },
  {
    id: ViewIds.walletConnection,
    view: WalletConnectionView,
    previousViewId: ViewIds.gauge,
    title: 'Connect a wallet',
    bgClassName: 'bg-new-modal',
    onCloseViewId: ViewIds.explore
  },
  {
    id: ViewIds.moreInfo,
    view: GaugeInfoView,
    title: 'More info',
    previousViewId: ViewIds.gauge
  }
]

export const ExplorePoolGaugesModal: React.FC<{
  isOpen: boolean
  closeModal: () => void
}> = (props) => {
  const { isOpen, closeModal: _closeModal } = props
  const [selectedViewId, setSelectedViewId] = useState<string | number>(ViewIds.explore)

  const { chainId } = useSelectedChainId()
  const { data: tokenData } = useSelectedPrizePoolTokens()
  const [stakeAmount, setStakeAmount] = useState<Amount>()
  const [stakeTransactionId, setStakeTransactionId] = useState('')
  const stakeTransaction = useTransaction(stakeTransactionId)
  const [unstakeAmount, setUnstakeAmount] = useState<Amount>()
  const [unstakeTransactionId, setUnstakeTransactionId] = useState('')
  const unstakeTransaction = useTransaction(unstakeTransactionId)

  /**
   * Submit the transaction to stake and store the transaction id in state
   */
  const sendStakeTransaction = useSendStakeTransaction(stakeAmount)

  /**
   * Submit the transaction to unstake and store the transaction id in state
   */
  const sendUnstakeTransaction = useSendUnstakeTransaction(unstakeAmount)

  const closeModal = useCallback(() => {
    if (stakeTransaction?.state === TransactionState.complete) {
      setStakeTransactionId('')
    }
    setSelectedViewId(ViewIds.explore)
    _closeModal()
  }, [stakeTransaction?.state])

  return (
    <ModalWithViewState
      label='explore-gauges-modal'
      bgClassName='bg-gradient-to-bl from-white to-gradient-purple dark:from-gradient-purple dark:to-gradient-pink'
      isOpen={isOpen}
      closeModal={closeModal}
      viewIds={ViewIds}
      views={views}
      selectedViewId={selectedViewId}
      setSelectedViewId={setSelectedViewId}
      // View props
      // GaugeView
      onStakeClick={() => setSelectedViewId(ViewIds.stake)}
      onUnstakeClick={() => setSelectedViewId(ViewIds.unstake)}
      onInfoClick={() => setSelectedViewId(ViewIds.moreInfo)}
      // StakeView
      stakeToken={tokenData?.token}
      stakeTransaction={stakeTransaction}
      setStakeAmount={setStakeAmount}
      clearStakeTransaction={() => setStakeTransactionId('')}
      // StakeReviewView
      stakeAmount={stakeAmount}
      sendStakeransaction={() => setStakeTransactionId(sendStakeTransaction())}
      // UnstakeView
      unstakeToken={tokenData?.token}
      unstakeTransaction={unstakeTransaction}
      setUnstakeAmount={setUnstakeAmount}
      clearUnstakeTransaction={() => setUnstakeTransactionId('')}
      // UnstakeReviewView
      unstakeAmount={stakeAmount}
      sendUnstakeransaction={() => setUnstakeTransactionId(sendUnstakeTransaction())}
      // TODO: This is needed pretty much everywhere...
      // WalletConnectionModalView
      onWalletConnected={() => setSelectedViewId(ViewIds.stake)}
    />
  )
}
