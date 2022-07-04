import { ModalWithViewState, ModalWithViewStateView } from '@pooltogether/react-components'
import { useState } from 'react'
import { BridgeTokensModalView } from './BridgeTokensModalView'
import { ExplorePrizePoolsModalView } from '../../../components/ModalViews/ExplorePrizePoolsModalView'
import { SwapTokensModalView } from './SwapTokensModalView'
import { WalletConnectionModalView } from '../../../components/ModalViews/WalletConnectionModalView'
import { DepositView } from './DepositView'
import { useTransaction, useUsersAddress } from '@pooltogether/wallet-connection'
import { useSelectedPrizePoolTokens } from '@hooks/v4/PrizePool/useSelectedPrizePoolTokens'
import { Amount } from '@pooltogether/hooks'
import { DepositReviewTransactionModalView } from './DepositReviewTransactionModalView'
import { ethers, Overrides } from 'ethers'
import { useTranslation } from 'react-i18next'
import { useSelectedPrizePool } from '@hooks/v4/PrizePool/useSelectedPrizePool'
import { useGetUser } from '@hooks/v4/User/useGetUser'
import { useUsersTicketDelegate } from '@hooks/v4/PrizePool/useUsersTicketDelegate'
import { useSendTransaction } from '@hooks/useSendTransaction'
import { FathomEvent, logEvent } from '@utils/services/fathom'
import { useUsersTotalTwab } from '@hooks/v4/PrizePool/useUsersTotalTwab'
import { useUsersPrizePoolBalances } from '@hooks/v4/PrizePool/useUsersPrizePoolBalances'

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
    view: ExplorePrizePoolsModalView,
    title: 'Select a prize pool',
    previousViewId: DepositViewIds.deposit
  },
  {
    id: DepositViewIds.reviewTransaction,
    view: DepositReviewTransactionModalView,
    title: 'Deposit review',
    previousViewId: DepositViewIds.deposit
  },
  {
    id: DepositViewIds.bridgeTokens,
    view: BridgeTokensModalView,
    previousViewId: DepositViewIds.deposit,
    title: '',
    bgClassName: 'bg-card'
  },
  {
    id: DepositViewIds.swapTokens,
    view: SwapTokensModalView,
    previousViewId: DepositViewIds.deposit,
    title: '',
    bgClassName: 'bg-card'
  },
  {
    id: DepositViewIds.walletConnection,
    view: WalletConnectionModalView,
    previousViewId: DepositViewIds.deposit,
    title: 'Connect a wallet',
    bgClassName: 'bg-new-modal'
  }
]

export const DepositModal: React.FC<{
  chainId: number
  isOpen: boolean
  closeModal: () => void
}> = (props) => {
  const { isOpen, closeModal, chainId } = props
  const [selectedViewId, setSelectedViewId] = useState<string | number>(DepositViewIds.deposit)
  const [depositAmount, setDepositAmount] = useState<Amount>()
  const prizePool = useSelectedPrizePool()
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
