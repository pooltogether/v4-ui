import { useTranslation } from 'react-i18next'
import { useForm } from 'react-hook-form'
import { Overrides } from 'ethers'
import { Amount, Transaction, useTransaction } from '@pooltogether/hooks'
import { useState } from 'react'

import { useIsWalletOnNetwork } from '@hooks/useIsWalletOnNetwork'
import { ModalNetworkGate } from '@components/Modal/ModalNetworkGate'
import { ModalTitle } from '@components/Modal/ModalTitle'
import { useSendTransaction } from '@hooks/useSendTransaction'
import { useSelectedChainIdUser } from '@hooks/v4/User/useSelectedChainIdUser'
import { ModalTransactionSubmitted } from '@components/Modal/ModalTransactionSubmitted'
import { WithdrawStepContent } from './WithdrawStepContent'
import { DepositItemsProps } from '.'
import { useUsersTotalTwab } from '@hooks/v4/PrizePool/useUsersTotalTwab'

export enum WithdrawalSteps {
  input,
  review,
  viewTxReceipt
}

interface WithdrawViewProps extends DepositItemsProps {
  usersAddress: string
  setWithdrawTxId: (txId: number) => void
  onDismiss: () => void
}

export const WithdrawView = (props: WithdrawViewProps) => {
  const { prizePool, usersAddress, balances, setWithdrawTxId, onDismiss, refetchBalances } = props
  const { t } = useTranslation()
  const { token } = balances

  const [txId, setTxId] = useState(0)
  const tx = useTransaction(txId)
  const [amountToWithdraw, setAmountToWithdraw] = useState<Amount>()
  const [currentStep, setCurrentStep] = useState<WithdrawalSteps>(WithdrawalSteps.input)
  const user = useSelectedChainIdUser()
  const sendTx = useSendTransaction()
  const isWalletOnProperNetwork = useIsWalletOnNetwork(prizePool.chainId)
  const {
    refetch: refetchTotalTwab
  } = useUsersTotalTwab(usersAddress)
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
          refetchBalances()
          refetchTotalTwab()
        }
      }
    })
    setWithdrawTxId(txId)
    setTxId(txId)
  }

  if (!isWalletOnProperNetwork) {
    return (
      <>
        <ModalTitle chainId={prizePool.chainId} title={t('wrongNetwork', 'Wrong network')} />
        <ModalNetworkGate chainId={prizePool.chainId} className='mt-8' />
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
          tx={tx}
          closeModal={onDismiss}
          hideCloseButton
        />
      </>
    )
  }

  return (
    <>
      <ModalTitle
        chainId={prizePool.chainId}
        title={t('withdrawTicker', { ticker: token.symbol })}
      />
      <WithdrawStepContent
        form={form}
        currentStep={currentStep}
        setCurrentStep={setCurrentStep}
        user={user}
        prizePool={prizePool}
        usersBalances={balances}
        refetchBalances={refetchBalances}
        amountToWithdraw={amountToWithdraw}
        setAmountToWithdraw={setAmountToWithdraw}
        withdrawTx={tx}
        setWithdrawTxId={setWithdrawTxId}
        sendWithdrawTx={sendWithdrawTx}
      />
    </>
  )
}
