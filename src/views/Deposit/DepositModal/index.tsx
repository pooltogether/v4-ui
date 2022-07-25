import { ModalWithViewState, ModalWithViewStateView } from '@pooltogether/react-components'
import { useState } from 'react'
import { BridgeTokensView } from './BridgeTokensView'
import { ExplorePrizePoolsView } from '../../../components/ModalViews/ExplorePrizePoolsView'
import { SwapTokensView } from './SwapTokensView'
import { WalletConnectionView } from '../../../components/ModalViews/WalletConnectionView'
import { DepositView } from './DepositView'
import { useTransaction, useUsersAddress } from '@pooltogether/wallet-connection'
import { useSelectedPrizePoolTokens } from '@hooks/v4/PrizePool/useSelectedPrizePoolTokens'
import { Amount } from '@pooltogether/hooks'
import { DepositReviewTransactionView } from './DepositReviewTransactionView'
import { ethers, Overrides } from 'ethers'
import { useTranslation } from 'react-i18next'
import { useSelectedPrizePool } from '@hooks/v4/PrizePool/useSelectedPrizePool'
import { useGetUser } from '@hooks/v4/User/useGetUser'
import { useUsersTicketDelegate } from '@hooks/v4/PrizePool/useUsersTicketDelegate'
import { useSendTransaction } from '@hooks/useSendTransaction'
import { FathomEvent, logEvent } from '@utils/services/fathom'
import { useUsersTotalTwab } from '@hooks/v4/PrizePool/useUsersTotalTwab'
import { useUsersPrizePoolBalances } from '@hooks/v4/PrizePool/useUsersPrizePoolBalances'
import { useSelectedChainId } from '@hooks/useSelectedChainId'

export enum DepositViewIds {
  deposit,
  explore,
  reviewTransaction,
  bridgeTokens,
  swapTokens,
  help,
  walletConnection
}

const views: ModalWithViewStateView[] = [
  {
    id: DepositViewIds.deposit,
    view: DepositView
  },
  {
    id: DepositViewIds.explore,
    view: ExplorePrizePoolsView,
    title: 'Select a prize pool',
    previousViewId: DepositViewIds.deposit
  },
  {
    id: DepositViewIds.reviewTransaction,
    view: DepositReviewTransactionView,
    title: 'Deposit review',
    previousViewId: DepositViewIds.deposit
  },
  {
    id: DepositViewIds.bridgeTokens,
    view: BridgeTokensView,
    previousViewId: DepositViewIds.deposit,
    title: '',
    bgClassName: 'bg-card'
  },
  {
    id: DepositViewIds.swapTokens,
    view: SwapTokensView,
    previousViewId: DepositViewIds.deposit,
    title: '',
    bgClassName: 'bg-card'
  },
  {
    id: DepositViewIds.walletConnection,
    view: WalletConnectionView,
    previousViewId: DepositViewIds.deposit,
    title: 'Connect a wallet',
    bgClassName: 'bg-new-modal'
  }
]

export const DepositModal: React.FC<{
  isOpen: boolean
  closeModal: () => void
}> = (props) => {
  const { isOpen, closeModal } = props
  const [selectedViewId, setSelectedViewId] = useState<string | number>(DepositViewIds.deposit)
  const [depositAmount, setDepositAmount] = useState<Amount>()
  const prizePool = useSelectedPrizePool()
  const { chainId } = useSelectedChainId()
  const getUser = useGetUser(prizePool)
  const { t } = useTranslation()
  const { data: tokenData } = useSelectedPrizePoolTokens()
  const [depositTransactionId, setDepositTransactionId] = useState('')
  const depositTransaction = useTransaction(depositTransactionId)
  const usersAddress = useUsersAddress()
  const { data: delegateData, refetch: refetchTicketDelegate } = useUsersTicketDelegate(
    usersAddress,
    prizePool
  )
  const { refetch: refetchUsersTotalTwab } = useUsersTotalTwab(usersAddress)
  const { refetch: refetchUsersBalances } = useUsersPrizePoolBalances(usersAddress, prizePool)
  const _sendTransaction = useSendTransaction()

  /**
   * Submit the transaction to deposit and store the transaction id in state
   */
  const sendTransaction = async () => {
    const name = `${t('save')} ${depositAmount.amountPretty} ${tokenData.token.symbol}`
    const overrides: Overrides = { gasLimit: 750000 }
    let contractMethod
    let callTransaction
    if (delegateData.ticketDelegate === ethers.constants.AddressZero) {
      contractMethod = 'depositToAndDelegate'
      callTransaction = async () => {
        const user = await getUser()
        return user.depositAndDelegate(depositAmount.amountUnformatted, usersAddress, overrides)
      }
    } else {
      contractMethod = 'depositTo'
      callTransaction = async () => {
        const user = await getUser()
        return user.deposit(depositAmount.amountUnformatted, overrides)
      }
    }

    const transactionId = await _sendTransaction({
      name,
      callTransaction,
      callbacks: {
        onConfirmedByUser: () => logEvent(FathomEvent.deposit),
        onSuccess: () => {
          refetchTicketDelegate()
        },
        refetch: () => {
          refetchUsersTotalTwab()
          refetchUsersBalances()
        }
      }
    })
    setDepositTransactionId(transactionId)
  }

  return (
    <ModalWithViewState
      title='Deposit in a Prize Pool'
      label='deposit-modal'
      bgClassName='bg-gradient-to-br from-white to-gradient-purple dark:from-gradient-purple dark:to-gradient-pink'
      isOpen={isOpen}
      closeModal={closeModal}
      viewIds={DepositViewIds}
      views={views}
      selectedViewId={selectedViewId}
      setSelectedViewId={setSelectedViewId}
      // BridgeTokensModalView
      chainId={chainId}
      // WalletConnectionModalView
      onWalletConnected={() => setSelectedViewId(DepositViewIds.deposit)}
      // DepositView
      token={tokenData?.token}
      transaction={depositTransaction}
      setDepositAmount={setDepositAmount}
      // ReviewView
      depositAmount={depositAmount}
      sendTransaction={sendTransaction}
    />
  )
}
