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
import { PrizePool } from '@pooltogether/v4-client-js'
import { Router, useRouter } from 'next/router'

export enum ViewIds {
  explore
}

export const ExplorePrizePoolsModal: React.FC<{
  isOpen: boolean
  closeModal: () => void
  onPrizePoolSelect?: (prizePool: PrizePool) => void
}> = (props) => {
  const { isOpen, closeModal, onPrizePoolSelect } = props
  const [selectedViewId, setSelectedViewId] = useState<string | number>(ViewIds.explore)

  const views: ModalWithViewStateView[] = [
    {
      id: ViewIds.explore,
      view: ExplorePrizePoolsView,
      title: 'Select a prize pool'
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
      onPrizePoolSelect={(prizePool: PrizePool) => {
        closeModal()
        onPrizePoolSelect?.(prizePool)
      }}
    />
  )
}
