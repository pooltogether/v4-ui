import FeatherIcon from 'feather-icons-react'
import { SquareButton, SquareButtonTheme, TokenIcon } from '@pooltogether/react-components'
import { getNetworkNiceNameByChainId } from '@pooltogether/utilities'
import { ModalTitle } from 'lib/components/Modal/ModalTitle'
import { useTranslation } from 'react-i18next'
import { BackButton, ManageSheetViews, ViewProps } from '.'
import { useIsWalletOnNetwork } from 'lib/hooks/useIsWalletOnNetwork'
import { ModalNetworkGate } from 'lib/components/Modal/ModalNetworkGate'
import { useForm } from 'react-hook-form'
import { Overrides } from 'ethers'
import { useSendTransaction } from 'lib/hooks/useSendTransaction'
import { useState } from 'react'
import { useSelectedChainIdUser } from 'lib/hooks/v4/User/useSelectedChainIdUser'
import { Amount, Transaction } from '@pooltogether/hooks'
import { useUsersAddress } from 'lib/hooks/useUsersAddress'
import { useUsersPrizePoolBalances } from 'lib/hooks/v4/PrizePool/useUsersPrizePoolBalances'
import { ModalTransactionSubmitted } from 'lib/components/Modal/ModalTransactionSubmitted'
import { WithdrawStepContent } from './WithdrawStepContent'

const WITHDRAW_QUANTITY_KEY = 'withdrawal-quantity'

export enum WithdrawalSteps {
  input,
  review,
  viewTxReceipt
}

interface WithdrawViewProps extends ViewProps {
  withdrawTx: Transaction
  setWithdrawTxId: (txId: number) => void
  onDismiss: () => void
}

export const WithdrawView = (props: WithdrawViewProps) => {
  const { prizePool, balances, setView, withdrawTx, setWithdrawTxId, onDismiss } = props
  const { t } = useTranslation()
  const { token } = balances

  const usersAddress = useUsersAddress()
  const [amountToWithdraw, setAmountToWithdraw] = useState<Amount>()
  const [currentStep, setCurrentStep] = useState<WithdrawalSteps>(WithdrawalSteps.input)
  const { isFetched: isUsersBalancesFetched, refetch: refetchUsersBalances } =
    useUsersPrizePoolBalances(usersAddress, prizePool)
  const user = useSelectedChainIdUser()
  const sendTx = useSendTransaction()
  const isWalletOnProperNetwork = useIsWalletOnNetwork(prizePool.chainId)
  const form = useForm({
    mode: 'onChange',
    reValidateMode: 'onChange'
  })

  const sendWithdrawTx = async (e) => {
    e.preventDefault()

    const tokenSymbol = token.symbol
    const overrides: Overrides = { gasLimit: 750000 }

    const txId = await sendTx({
      name: `${t('withdraw')} ${amountToWithdraw?.amountPretty} ${tokenSymbol}`,
      method: 'withdrawInstantlyFrom',
      callTransaction: () => user.withdraw(amountToWithdraw?.amountUnformatted, overrides),
      callbacks: {
        onSent: () => setCurrentStep(WithdrawalSteps.viewTxReceipt),
        refetch: () => {
          refetchUsersBalances()
        }
      }
    })
    setWithdrawTxId(txId)
  }

  if (!isWalletOnProperNetwork) {
    return (
      <>
        <ModalTitle chainId={prizePool.chainId} title={t('wrongNetwork', 'Wrong network')} />
        <ModalNetworkGate chainId={prizePool.chainId} className='mt-8' />
        <BackButton onClick={() => setView(ManageSheetViews.main)} />
      </>
    )
  }

  if (currentStep === WithdrawalSteps.viewTxReceipt) {
    return (
      <>
        <ModalTitle
          chainId={prizePool.chainId}
          title={t('withdrawalSubmitted', 'Withdrawal submitted')}
        />
        <ModalTransactionSubmitted
          className='mt-8'
          chainId={prizePool.chainId}
          tx={withdrawTx}
          closeModal={onDismiss}
          hideCloseButton
        />
        <BackButton onClick={() => setView(ManageSheetViews.main)} />
      </>
    )
  }

  return (
    <>
      <ModalTitle
        chainId={prizePool.chainId}
        title={t('withdrawTicker', { ticker: token.symbol })}
      />
      <BackButton onClick={() => setView(ManageSheetViews.main)} />
      <WithdrawStepContent
        form={form}
        currentStep={currentStep}
        setCurrentStep={setCurrentStep}
        user={user}
        prizePool={prizePool}
        usersBalances={balances}
        isUsersBalancesFetched={isUsersBalancesFetched}
        refetchUsersBalances={refetchUsersBalances}
        amountToWithdraw={amountToWithdraw}
        setAmountToWithdraw={setAmountToWithdraw}
        withdrawTx={withdrawTx}
        setWithdrawTxId={setWithdrawTxId}
        sendWithdrawTx={sendWithdrawTx}
      />
    </>
  )
}
