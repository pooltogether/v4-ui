import { Amount, Transaction, useTransaction, useV3ExitFee } from '@pooltogether/hooks'
import { ModalTitle } from '@pooltogether/react-components'
import { useState } from 'react'
import { useForm } from 'react-hook-form'
import { useTranslation } from 'react-i18next'

import { DepositItemsProps } from '..'
import { WithdrawStepContent } from './WithdrawStepContent'
import PrizePoolAbi from '@abis/V3_PrizePool'
import { ModalNetworkGate } from '@src/components/Modal/ModalNetworkGate'
import { useIsWalletOnNetwork } from '@src/hooks/useIsWalletOnNetwork'
import { useSendTransaction } from '@src/hooks/useSendTransaction'
import { useUsersAddress } from '@src/hooks/useUsersAddress'
import { numberWithCommas } from '@pooltogether/utilities'

export enum WithdrawalSteps {
  input,
  review,
  viewTxReceipt
}

interface WithdrawViewProps extends DepositItemsProps {
  setWithdrawTxId: (txId: number) => void
  onDismiss: () => void
}

export const PrizePoolWithdrawView = (props: WithdrawViewProps) => {
  const { prizePool, refetchBalances, setWithdrawTxId, onDismiss, ticket, token } = props

  const chainId = prizePool.chainId

  const [txId, setTxId] = useState(0)
  const tx = useTransaction(txId)
  const [amountToWithdraw, setAmountToWithdraw] = useState<Amount>()
  const [currentStep, setCurrentStep] = useState<WithdrawalSteps>(WithdrawalSteps.input)
  const sendTx = useSendTransaction()
  const isWalletOnProperNetwork = useIsWalletOnNetwork(prizePool.chainId)
  const form = useForm({
    mode: 'onChange',
    reValidateMode: 'onChange'
  })

  const usersAddress = useUsersAddress()
  const poolAddress = prizePool.addresses.prizePool

  const {
    data: exitFee,
    isFetched: isExitFeeFetched,
    isFetching: isExitFeeFetching
  } = useV3ExitFee(
    chainId,
    poolAddress,
    ticket.address,
    usersAddress,
    amountToWithdraw?.amountUnformatted
  )

  const sendWithdrawTx = async (e) => {
    e.preventDefault()

    const params = [usersAddress, amountToWithdraw?.amountUnformatted, ticket.address, exitFee]

    const withdrawalAmountPretty = numberWithCommas(
      amountToWithdraw.amountUnformatted.sub(exitFee),
      { decimals: token.decimals }
    )

    const txId = await sendTx({
      name: `${t('withdraw')} ${withdrawalAmountPretty} ${token.symbol}`,
      method: 'withdrawInstantlyFrom',
      contractAddress: poolAddress,
      contractAbi: PrizePoolAbi,
      params,
      callbacks: {
        onSent: () => setCurrentStep(WithdrawalSteps.viewTxReceipt),
        refetch: () => {
          refetchBalances()
        }
      }
    })
    setWithdrawTxId(txId)
    setTxId(txId)
  }

  const { t } = useTranslation()

  if (!isWalletOnProperNetwork) {
    return (
      <>
        <ModalTitle chainId={prizePool.chainId} title={t('wrongNetwork', 'Wrong network')} />
        <ModalNetworkGate chainId={prizePool.chainId} className='mt-8' />
      </>
    )
  }

  return (
    <>
      <WithdrawStepContent
        prizePool={prizePool}
        ticket={ticket}
        token={token}
        form={form}
        currentStep={currentStep}
        setCurrentStep={setCurrentStep}
        usersBalance={ticket}
        refetchBalances={refetchBalances}
        amountToWithdraw={amountToWithdraw}
        setAmountToWithdraw={setAmountToWithdraw}
        withdrawTx={tx}
        setWithdrawTxId={setWithdrawTxId}
        sendWithdrawTx={sendWithdrawTx}
        onDismiss={onDismiss}
        exitFee={exitFee}
        isExitFeeFetched={isExitFeeFetched}
        isExitFeeFetching={isExitFeeFetching}
      />
    </>
  )
}
