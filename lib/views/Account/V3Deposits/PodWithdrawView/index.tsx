import { Amount, useTransaction } from '@pooltogether/hooks'
import { ModalTitle } from '@pooltogether/react-components'
import { useState } from 'react'
import { useForm } from 'react-hook-form'
import { useTranslation } from 'react-i18next'
import { numberWithCommas } from '@pooltogether/utilities'

import PodAbi from 'abis/V3_Pod'
import { DepositItemsProps } from '..'
import { WithdrawStepContent } from './WithdrawStepContent'
import { ModalNetworkGate } from 'lib/components/Modal/ModalNetworkGate'
import { useIsWalletOnNetwork } from 'lib/hooks/useIsWalletOnNetwork'
import { useSendTransaction } from 'lib/hooks/useSendTransaction'
import { usePodExitFee } from 'lib/hooks/v3/usePodExitFee'
import { parseUnits } from '@ethersproject/units'
import { getAmountFromBigNumber } from 'lib/utils/getAmountFromBigNumber'

export enum WithdrawalSteps {
  input,
  review,
  viewTxReceipt
}

interface WithdrawViewProps extends DepositItemsProps {
  setWithdrawTxId: (txId: number) => void
  onDismiss: () => void
}

export const PodWithdrawView = (props: WithdrawViewProps) => {
  const { prizePool, refetchBalances, setWithdrawTxId, onDismiss, ticket, token, pricePerShare } =
    props

  const chainId = prizePool.chainId

  const [txId, setTxId] = useState(0)
  const tx = useTransaction(txId)
  const [amountToWithdraw, setAmountToWithdraw] = useState<Amount>()
  const [amountToReceive, setAmountToReceive] = useState<Amount>()
  const [currentStep, setCurrentStep] = useState<WithdrawalSteps>(WithdrawalSteps.input)
  const sendTx = useSendTransaction()
  const isWalletOnProperNetwork = useIsWalletOnNetwork(prizePool.chainId)
  const form = useForm({
    mode: 'onChange',
    reValidateMode: 'onChange'
  })

  const {
    data: podExitFee,
    isFetched: isExitFeeFetched,
    isFetching: isExitFeeFetching
  } = usePodExitFee(
    chainId,
    prizePool.addresses.pod,
    prizePool.addresses.token,
    amountToWithdraw?.amountUnformatted || null,
    token.decimals
  )

  const sendWithdrawTx = async (e) => {
    e.preventDefault()

    const params = [amountToWithdraw.amountUnformatted, podExitFee.exitFee.amountUnformatted]
    const txName = `${t('withdraw')} ${numberWithCommas(amountToWithdraw.amountPretty)} ${
      token.symbol
    }`

    const txId = await sendTx({
      name: txName,
      contractAbi: PodAbi,
      contractAddress: prizePool.addresses.pod,
      method: 'withdraw',
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

  const setStateForWithdrawal = (amount: Amount) => {
    setAmountToWithdraw(amount)
    setAmountToReceive(
      getAmountFromBigNumber(
        amount.amountUnformatted
          .mul(parseUnits('1', ticket.decimals))
          .mul(pricePerShare.amountUnformatted)
          .div(parseUnits('1', ticket.decimals))
          .div(parseUnits('1', ticket.decimals)),
        ticket.decimals
      )
    )
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
        amountToReceive={amountToReceive}
        pricePerShare={pricePerShare}
        setAmountToWithdraw={setStateForWithdrawal}
        withdrawTx={tx}
        setWithdrawTxId={setWithdrawTxId}
        sendWithdrawTx={sendWithdrawTx}
        onDismiss={onDismiss}
        exitFee={podExitFee?.exitFee.amountUnformatted}
        isExitFeeFetched={isExitFeeFetched}
        isExitFeeFetching={isExitFeeFetching}
      />
    </>
  )
}
