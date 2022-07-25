import { ModalWithViewState, ModalWithViewStateView } from '@pooltogether/react-components'
import { useState } from 'react'
import {
  getChainNameByChainId,
  useTransaction,
  useUsersAddress
} from '@pooltogether/wallet-connection'
import { useSelectedPrizePoolTokens } from '@hooks/v4/PrizePool/useSelectedPrizePoolTokens'
import { Amount } from '@pooltogether/hooks'
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
import { MainView } from './MainView'
import { DepositView } from './DepositView'
import { DepositReviewView } from './DepositReviewView'
import { WithdrawView } from './WithdrawView'
import { WithdrawReviewView } from './WithdrawReviewView'
import { MoreInfoView } from './MoreInfoView'
import { getChainByChainId } from '@pooltogether/evm-chains-extended'

export enum ViewIds {
  main,
  deposit,
  depositReview,
  withdraw,
  withdrawReview,
  moreInfo
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
    previousViewId: ViewIds.main
  },
  {
    id: ViewIds.withdrawReview,
    view: WithdrawReviewView,
    title: 'Withdraw review',
    previousViewId: ViewIds.withdraw
  },
  {
    id: ViewIds.moreInfo,
    view: MoreInfoView,
    title: 'More info',
    previousViewId: ViewIds.main
  }
]

export const BalanceModal: React.FC<{
  isOpen: boolean
  closeModal: () => void
}> = (props) => {
  const { isOpen, closeModal } = props
  const [selectedViewId, setSelectedViewId] = useState<string | number>(ViewIds.main)
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
      title={`${tokenData?.token.symbol} deposits on ${getChainNameByChainId(chainId)}`}
      label='balance-modal'
      bgClassName='bg-gradient-to-br from-white to-gradient-purple dark:from-gradient-purple dark:to-gradient-pink'
      isOpen={isOpen}
      closeModal={closeModal}
      viewIds={ViewIds}
      views={views}
      selectedViewId={selectedViewId}
      setSelectedViewId={setSelectedViewId}
      // BridgeTokensModalView
      chainId={chainId}
      // WalletConnectionModalView
      onWalletConnected={() => setSelectedViewId(ViewIds.deposit)}
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
