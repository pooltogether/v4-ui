import { WalletConnectionView } from '@components/ModalViews/WalletConnectionView'
import { SUPPORTED_EIP2612_PRIZE_POOL_IDS } from '@constants/config'
import { useSelectedChainId } from '@hooks/useSelectedChainId'
import { useSelectedPrizePool } from '@hooks/v4/PrizePool/useSelectedPrizePool'
import { useSendDepositTransaction } from '@hooks/v4/PrizePool/useSendDepositTransaction'
import { Amount } from '@pooltogether/hooks'
import {
  BottomSheetWithViewState,
  ModalWithViewStateView,
  snapToFull
} from '@pooltogether/react-components'
import {
  ERC2612PermitMessage,
  ERC2612TicketPermitMessage,
  PrizePool
} from '@pooltogether/v4-client-js'
import { useTransaction } from '@pooltogether/wallet-connection'
import { useConnectModal } from '@rainbow-me/rainbowkit'
import { ApprovalType } from '@views/Deposit/DepositTrigger/DepositModal'
import { RSV } from 'eth-permit/dist/rpc'
import { useCallback, useEffect, useState } from 'react'
import { DepositReviewView } from './DepositReviewView'
import { DepositView } from './DepositView'

export enum ViewIds {
  deposit,
  reviewTransaction,
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
  const [formAmount, setFormAmount] = useState<string>()
  const { chainId } = useSelectedChainId()
  const [depositTransactionId, setDepositTransactionId] = useState('')
  const depositTransaction = useTransaction(depositTransactionId)
  const prizePool = useSelectedPrizePool()

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

  const views: ModalWithViewStateView[] = [
    {
      id: ViewIds.deposit,
      view: DepositView,
      header: 'Deposit in a Prize Pool'
    },
    {
      id: ViewIds.reviewTransaction,
      view: DepositReviewView,
      header: 'Deposit review',
      previousViewId: ViewIds.deposit,
      onCloseViewId: ViewIds.deposit
    },
    {
      id: ViewIds.walletConnection,
      view: WalletConnectionView,
      previousViewId: ViewIds.deposit,
      header: 'Connect a wallet',
      onCloseViewId: ViewIds.deposit
    }
  ]

  const onPrizePoolSelect = (prizePool: PrizePool) => {
    setSelectedViewId(ViewIds.deposit)
  }

  const { openConnectModal } = useConnectModal()

  return (
    <BottomSheetWithViewState
      snapPoints={snapToFull}
      label='deposit-modal'
      modalHeightClassName='h-actually-full-screen min-h-1/2 xs:h-auto'
      maxHeightClassName='max-h-actually-full-screen xs:max-h-90-screen'
      maxWidthClassName='max-w-screen-xs'
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
      formAmount={formAmount}
      setFormAmount={setFormAmount}
      // reviewView
      sendDepositTransaction={sendDepositTransaction}
      clearDepositTransaction={() => setDepositTransactionId('')}
      connectWallet={openConnectModal}
      approvalType={approvalType}
      setApprovalType={setApprovalType}
      eip2612DepositPermit={eip2612DepositPermit}
      eip2612DelegationPermit={eip2612DelegationPermit}
      setEip2612DepositPermit={setEip2612DepositPermit}
      setEip2612DelegationPermit={setEip2612DelegationPermit}
    />
  )
}

DepositModal.defaultProps = {
  initialViewId: ViewIds.deposit
}
