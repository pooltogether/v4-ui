import PodAbi from '@abis/V3_Pod'
import { ModalNetworkGate } from '@components/Modal/ModalNetworkGate'
import { parseUnits } from '@ethersproject/units'
import { usePodExitFee } from '@hooks/v3/usePodExitFee'
import { Amount } from '@pooltogether/hooks'
import { ModalTitle } from '@pooltogether/react-components'
import { numberWithCommas } from '@pooltogether/utilities'
import {
  useIsWalletOnChainId,
  useSendTransaction,
  useTransaction
} from '@pooltogether/wallet-connection'
import { getAmountFromBigNumber } from '@utils/getAmountFromBigNumber'
import { Contract } from 'ethers'
import { useState } from 'react'
import { useForm } from 'react-hook-form'
import { useTranslation } from 'react-i18next'
import { useSigner } from 'wagmi'

import { DepositItemsProps } from '..'
import { WithdrawStepContent } from './WithdrawStepContent'


export enum WithdrawalSteps {
  input,
  review,
  viewTxReceipt
}

interface WithdrawViewProps extends DepositItemsProps {
  setWithdrawTxId: (txId: string) => void
  onDismiss: () => void
}

export const PodWithdrawView = (props: WithdrawViewProps) => {
  const { prizePool, refetchBalances, setWithdrawTxId, onDismiss, ticket, token, pricePerShare } =
    props

  const chainId = prizePool.chainId

  const [txId, setTxId] = useState('')
  const tx = useTransaction(txId)
  const [amountToWithdraw, setAmountToWithdraw] = useState<Amount>()
  const [amountToReceive, setAmountToReceive] = useState<Amount>()
  const [currentStep, setCurrentStep] = useState<WithdrawalSteps>(WithdrawalSteps.input)
  const sendTransaction = useSendTransaction()
  const isWalletOnProperNetwork = useIsWalletOnChainId(prizePool.chainId)
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

  const { data: signer } = useSigner()

  const sendWithdrawTx = async () => {
    const args = [amountToWithdraw.amountUnformatted, podExitFee.exitFee.amountUnformatted]
    const txName = `${t('withdraw')} ${numberWithCommas(amountToWithdraw.amountPretty)} ${
      token.symbol
    }`

    const txId = sendTransaction({
      name: txName,
      callTransaction: () => {
        const contract = new Contract(prizePool.addresses.pod, PodAbi, signer)
        return contract.withdraw(...args)
      },
      callbacks: {
        onConfirmedByUser: () => setCurrentStep(WithdrawalSteps.viewTxReceipt),
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
