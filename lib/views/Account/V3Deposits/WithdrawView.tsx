import { Amount, Transaction, useV3ExitFee } from '.yalc/@pooltogether/hooks/dist'
import { ModalTitle } from '@pooltogether/react-components'
import { useState } from 'react'
import { useForm } from 'react-hook-form'
import { useTranslation } from 'react-i18next'
import { prettyNumber } from '@pooltogether/utilities'

import { DepositItemsProps } from '.'
import { WithdrawStepContent } from './WithdrawStepContent'
import PrizePoolAbi from 'abis/V3_3PrizePoolAbi'
import { ModalNetworkGate } from 'lib/components/Modal/ModalNetworkGate'
import { useIsWalletOnNetwork } from 'lib/hooks/useIsWalletOnNetwork'
import { useSendTransaction } from 'lib/hooks/useSendTransaction'
import { useUsersAddress } from 'lib/hooks/useUsersAddress'

export enum WithdrawalSteps {
  input,
  review,
  viewTxReceipt
}

interface WithdrawViewProps extends DepositItemsProps {
  prizePool: any
  withdrawTx: Transaction
  refetchBalances: () => void
  setWithdrawTxId: (txId: number) => void
  onDismiss: () => void
}

export const WithdrawView = (props: WithdrawViewProps) => {
  const { prizePool, refetchBalances, setWithdrawTxId, withdrawTx, onDismiss, balance } = props

  const chainId = prizePool.chainId

  const [amountToWithdraw, setAmountToWithdraw] = useState<Amount>()
  const [currentStep, setCurrentStep] = useState<WithdrawalSteps>(WithdrawalSteps.input)
  const sendTx = useSendTransaction()
  const isWalletOnProperNetwork = useIsWalletOnNetwork(prizePool.chainId)
  const form = useForm({
    mode: 'onChange',
    reValidateMode: 'onChange'
  })

  const usersAddress = useUsersAddress()
  const poolAddress = prizePool.prizePool.address
  const ticket = prizePool.tokens.ticket
  const ticketAddress = ticket.address

  const {
    data: exitFee,
    isFetched: isExitFeeFetched,
    isFetching: isExitFeeFetching
  } = useV3ExitFee(
    chainId,
    poolAddress,
    ticketAddress,
    usersAddress,
    amountToWithdraw?.amountUnformatted
  )

  console.log({
    amount: amountToWithdraw?.amountPretty,
    exitFee,
    isExitFeeFetched,
    isExitFeeFetching
  })

  const sendWithdrawTx = async (e) => {
    e.preventDefault()

    const tokenSymbol = prizePool.tokens.underlyingToken.symbol

    const params = [usersAddress, amountToWithdraw?.amountUnformatted, ticketAddress, exitFee]

    const withdrawalAmountPretty = prettyNumber(
      amountToWithdraw.amountUnformatted.sub(exitFee),
      prizePool.tokens.underlyingToken.decimals
    )

    const txId = await sendTx({
      name: `${t('withdraw')} ${withdrawalAmountPretty} ${tokenSymbol}`,
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
        form={form}
        currentStep={currentStep}
        setCurrentStep={setCurrentStep}
        prizePool={prizePool}
        usersBalance={balance}
        refetchBalances={refetchBalances}
        amountToWithdraw={amountToWithdraw}
        setAmountToWithdraw={setAmountToWithdraw}
        withdrawTx={withdrawTx}
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
