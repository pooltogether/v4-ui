import classNames from 'classnames'
import { useTranslation } from 'react-i18next'
import { useForm } from 'react-hook-form'
import { Overrides } from 'ethers'
import { Amount } from '@pooltogether/hooks'
import { useState } from 'react'
import { ModalTitle } from '@pooltogether/react-components'
import { useTransaction } from '@pooltogether/wallet-connection'

import { useSendTransaction } from '@hooks/useSendTransaction'
import { ModalTransactionSubmitted } from '@components/Modal/ModalTransactionSubmitted'
import { WithdrawStepContent } from './WithdrawStepContent'
import { DepositItemsProps } from '.'
import { useUsersTotalTwab } from '@hooks/v4/PrizePool/useUsersTotalTwab'
import { useGetUser } from '@hooks/v4/User/useGetUser'
import { FathomEvent, logEvent } from '@utils/services/fathom'

export enum WithdrawalSteps {
  input,
  review,
  viewTxReceipt
}

interface WithdrawViewProps extends DepositItemsProps {
  usersAddress: string
  setWithdrawTxId: (txId: string) => void
  onDismiss: () => void
}

export const WithdrawView = (props: WithdrawViewProps) => {
  const { prizePool, usersAddress, balances, setWithdrawTxId, onDismiss, refetchBalances } = props
  const { t } = useTranslation()
  const { token } = balances

  const [txId, setTxId] = useState('')
  const tx = useTransaction(txId)
  const [amountToWithdraw, setAmountToWithdraw] = useState<Amount>()
  const [currentStep, setCurrentStep] = useState<WithdrawalSteps>(WithdrawalSteps.input)
  const getUser = useGetUser(prizePool)
  const sendTransaction = useSendTransaction()
  const { refetch: refetchUsersTotalTwab } = useUsersTotalTwab(usersAddress)
  const form = useForm({
    mode: 'onChange',
    reValidateMode: 'onChange'
  })

  const sendWithdrawTx = async () => {
    const tokenSymbol = token.symbol
    const overrides: Overrides = { gasLimit: 750000 }

    const txId = await sendTransaction({
      name: `${t('withdraw')} ${amountToWithdraw?.amountPretty} ${tokenSymbol}`,
      callTransaction: async () => {
        const user = await getUser()
        return user.withdraw(amountToWithdraw?.amountUnformatted, overrides)
      },
      callbacks: {
        onConfirmedByUser: () => {
          setCurrentStep(WithdrawalSteps.viewTxReceipt)
          logEvent(FathomEvent.withdrawal)
        },
        refetch: () => {
          refetchBalances()
          refetchUsersTotalTwab()
        }
      }
    })
    setWithdrawTxId(txId)
    setTxId(txId)
  }

  if (currentStep === WithdrawalSteps.viewTxReceipt) {
    return (
      <>
        <ModalTitle
          chainId={prizePool.chainId}
          title={t('withdrawalSubmitted', 'Withdrawal submitted')}
        />

        <WithdrawReasonForm />

        <ModalTransactionSubmitted className='mt-8' chainId={prizePool.chainId} tx={tx} />
      </>
    )
  }

  return (
    <>
      <ModalTitle
        chainId={prizePool.chainId}
        title={t('withdrawTicker', { ticker: token.symbol })}
        className='pb-2'
      />
      <WithdrawStepContent
        form={form}
        currentStep={currentStep}
        setCurrentStep={setCurrentStep}
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

const REASON_KEY = 'reason'

const WithdrawReasonForm = (props) => {
  const { t } = useTranslation()

  const form = useForm({
    mode: 'onChange',
    reValidateMode: 'onChange'
  })

  const {
    handleSubmit,
    formState: { isValid, isDirty, errors },
    watch
  } = form

  const onSubmit = (data) => {
    const reason = data[REASON_KEY]
    const result = await submitToGoogleSheets(reason)
    setSuccess(true)
  }

  return (
    <form
      onSubmit={handleSubmit(onSubmit)}
      className={classNames('my-10 lg:my-16', {
        hidden: success
      })}
    >
      <div className='flex flex-col justify-center field has-addons rounded w-full'>
        <label
          className='block text-purple-600 text-xs sm:text-base cursor-pointer mb-1 lg:mb-2 text-center'
          htmlFor='reason'
        >
          {t('letUsKnowWhyYoureWithdrawing')}
        </label>
        <Input
          id='reason'
          type='text'
          placeholder={t('reason')}
          className='input'
          value={reason}
          onChange={this.handleReasonChange}
        />
        {/* <Button
              color='green'
            >
              {t('send')}
            </Button> */}
      </div>

      <div
        className={classnames('my-10 text-centered', {
          hidden: !success
        })}
      >
        <p className='text-sm text-center lg:text-lg my-2 lg:my-8 lg:my-12 text-white w-10/12 lg:w-3/4 m-auto'>
          <FeatherIcon icon='check' className='m-auto mb-2' />
          {t('thanksForTheFeedback')}!
        </p>
      </div>

      <SquareButton disabled={!isValid && isDirty} type='submit' className='w-full mt-8'>
        {t('reviewWithdrawal')}
      </SquareButton>
    </form>
  )
}

const submitToGoogleSheets = () => {}
