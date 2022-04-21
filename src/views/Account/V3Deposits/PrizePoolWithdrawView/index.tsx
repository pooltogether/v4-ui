import { Amount, useV3ExitFee } from '@pooltogether/hooks'
import { ModalTitle } from '@pooltogether/react-components'
import { useEffect, useState } from 'react'
import { useForm } from 'react-hook-form'
import { useTranslation } from 'react-i18next'
import {
  useCallTransaction,
  useIsWalletOnChainId,
  useTransaction
} from '@pooltogether/wallet-connection'

import { DepositItemsProps } from '..'
import { WithdrawStepContent } from './WithdrawStepContent'
import PrizePoolAbi from '@abis/V3_PrizePool'
import { ModalNetworkGate } from '@components/Modal/ModalNetworkGate'
import { useSendTransaction } from '@hooks/useSendTransaction'
import { useUsersAddress } from '@pooltogether/wallet-connection'
import { numberWithCommas } from '@pooltogether/utilities'

export enum WithdrawalSteps {
  input,
  review,
  viewTxReceipt
}

interface WithdrawViewProps extends DepositItemsProps {
  setWithdrawTxId: (txId: string) => void
  onDismiss: () => void
}

export const PrizePoolWithdrawView = (props: WithdrawViewProps) => {
  const { prizePool, refetchBalances, setWithdrawTxId, onDismiss, ticket, token } = props

  const chainId = prizePool.chainId

  const [txId, setTxId] = useState('')
  const tx = useTransaction(txId)
  const [amountToWithdraw, setAmountToWithdraw] = useState<Amount>()
  const [currentStep, setCurrentStep] = useState<WithdrawalSteps>(WithdrawalSteps.input)
  const sendTransaction = useSendTransaction()
  const isWalletOnProperNetwork = useIsWalletOnChainId(prizePool.chainId)
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

  useEffect(() => {
    console.log({ exitFee, isExitFeeFetched, isExitFeeFetching })
  }, [exitFee, isExitFeeFetched, isExitFeeFetching])

  const callTransaction = useCallTransaction('withdrawInstantlyFrom', poolAddress, PrizePoolAbi)

  const sendWithdrawTx = async () => {
    const args = [usersAddress, amountToWithdraw?.amountUnformatted, ticket.address, exitFee]

    console.log('sendWithdrawTx', { amountToWithdraw, exitFee })
    const withdrawalAmountPretty = numberWithCommas(
      amountToWithdraw.amountUnformatted.sub(exitFee),
      { decimals: token.decimals }
    )

    const txId = await sendTransaction({
      name: `${t('withdraw')} ${withdrawalAmountPretty} ${token.symbol}`,
      callTransaction: () => callTransaction({ args }),
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

  console.log('PrizePoolWithdrawView', { exitFee })

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
  )
}
