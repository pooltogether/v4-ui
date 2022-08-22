import { ModalWithViewState, ModalWithViewStateView } from '@pooltogether/react-components'
import { useState } from 'react'
import { BridgeTokensView } from './BridgeTokensView'
import { ExplorePrizePoolsView } from '../../../../components/ModalViews/ExplorePrizePoolsView'
import { SwapTokensView } from './SwapTokensView'
import { WalletConnectionView } from '../../../../components/ModalViews/WalletConnectionView'
import { DepositView } from './DepositView'
import { useTransaction, useUsersAddress } from '@pooltogether/wallet-connection'
import { useSelectedPrizePoolTokens } from '@hooks/v4/PrizePool/useSelectedPrizePoolTokens'
import { Amount } from '@pooltogether/hooks'
import { DepositReviewView } from './DepositReviewView'
import { ethers, Overrides } from 'ethers'
import { useTranslation } from 'react-i18next'
import { useSelectedPrizePool } from '@hooks/v4/PrizePool/useSelectedPrizePool'
import { useGetUser } from '@hooks/v4/User/useGetUser'
import { useUsersTicketDelegate } from '@hooks/v4/PrizePool/useUsersTicketDelegate'
import { useSendTransaction } from '@hooks/useSendTransaction'
import { FathomEvent, logEvent } from '@utils/services/fathom'
import { useUsersTotalTwab } from '@hooks/v4/PrizePool/useUsersTotalTwab'
import { useUsersPrizePoolBalancesWithFiat } from '@hooks/v4/PrizePool/useUsersPrizePoolBalancesWithFiat'
import { useSelectedChainId } from '@hooks/useSelectedChainId'
import { PrizePool } from '@pooltogether/v4-client-js'

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
}> = (props) => {
  const { isOpen, closeModal } = props
  const [selectedViewId, setSelectedViewId] = useState<string | number>(ViewIds.explore)
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
  const { refetch: refetchUsersBalances } = useUsersPrizePoolBalancesWithFiat(
    usersAddress,
    prizePool
  )
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
      id: ViewIds.bridgeTokens,
      view: BridgeTokensView,
      previousViewId: ViewIds.deposit,
      title: '',
      bgClassName: 'bg-card',
      onCloseViewId: ViewIds.explore
    },
    {
      id: ViewIds.swapTokens,
      view: SwapTokensView,
      previousViewId: ViewIds.deposit,
      title: '',
      bgClassName: 'bg-card',
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

  const onPrizePoolSelect = (prizePool: PrizePool) => {
    console.log('onPrizePoolSelect', prizePool)
    setSelectedViewId(ViewIds.deposit)
  }

  return (
    <ModalWithViewState
      label='deposit-modal'
      bgClassName='bg-gradient-to-br from-white to-pt-purple-lighter dark:from-gradient-purple dark:to-pt-purple'
      modalHeightClassName='h-actually-full-screen sm:h-auto min-h-1/2'
      widthClassName='w-screen sm:w-full'
      roundedClassName='rounded-none sm:rounded-xl'
      className='h-full'
      maxWidthClassName='sm:max-w-2xl'
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
      token={tokenData?.token}
      transaction={depositTransaction}
      setDepositAmount={setDepositAmount}
      // ReviewView
      depositAmount={depositAmount}
      sendTransaction={sendTransaction}
      connectWallet={() => setSelectedViewId(ViewIds.walletConnection)}
    />
  )
}
