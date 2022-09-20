import { StyledInput } from '@components/Input'
import { Label } from '@components/Label'
import { ModalTransactionSubmitted } from '@components/Modal/ModalTransactionSubmitted'
import { useSendTransaction } from '@hooks/useSendTransaction'
import { useUsersTotalTwab } from '@hooks/v4/PrizePool/useUsersTotalTwab'
import { useGetUser } from '@hooks/v4/User/useGetUser'
import { Amount } from '@pooltogether/hooks'
import { SquareButton, SquareButtonTheme } from '@pooltogether/react-components'
import { ModalTitle } from '@pooltogether/react-components'
import { useTransaction } from '@pooltogether/wallet-connection'
import { FathomEvent, logEvent } from '@utils/services/fathom'
import axios from 'axios'
import classNames from 'classnames'
import { Overrides } from 'ethers'
import { useTranslation } from 'next-i18next'
import { useState } from 'react'
import { useForm } from 'react-hook-form'
import { DepositItemsProps } from '.'
import { WithdrawStepContent } from './WithdrawStepContent'

const GOOGLE_SHEETS_WITHDRAW_REASON_API_URL = `https://main--pooltogether-google-sheets.netlify.app/.netlify/functions/google`

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

        <ModalTransactionSubmitted className='mt-8' chainId={prizePool.chainId} tx={tx} />

        <WithdrawReasonForm />
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

  const [success, setSuccess] = useState(false)
  const [sending, setSending] = useState(false)
  const [errorMessage, setErrorMessage] = useState('')

  const form = useForm({
    mode: 'onChange',
    reValidateMode: 'onChange'
  })

  const {
    register,
    handleSubmit,
    formState: { isValid, isDirty, errors }
  } = form

  const onSubmit = async (data) => {
    setSending(true)
    setErrorMessage('')

    const reason = data[REASON_KEY]
    const response = await axios.get(`${GOOGLE_SHEETS_WITHDRAW_REASON_API_URL}?reason=${reason}`)

    if (response.data.error) {
      setSending(false)
      setErrorMessage(response.data.message)
    } else {
      setSuccess(true)
    }
  }

  return (
    <>
      <form
        onSubmit={handleSubmit(onSubmit)}
        className={classNames('border-t-2 dark:border-pt-purple-dark pt-4 mt-10', {
          hidden: success
        })}
      >
        <div className='flex flex-col justify-center field has-addons rounded w-full'>
          <Label className='uppercase mb-1' htmlFor='reason'>
            {t('letUsKnowWhyYoureWithdrawing')}
          </Label>

          <StyledInput
            id='token'
            disabled={sending}
            invalid={!!errors.reason}
            className='w-full'
            placeholder={t('yourReasonForWithdrawing', 'your reason for withdrawing...')}
            {...register(REASON_KEY, {
              required: {
                value: true,
                message: t('reasonIsRequired', 'Reason is required')
              }
              // validate: {
              //   isAddress: (v) => isAddress(v) || 'Invalid address'
              // }
            })}
          />
        </div>

        {errorMessage && (
          <div className='bg-pt-purple-darker rounded-lg px-2 mt-1 text-pt-red'>
            <span>{errorMessage}</span>
          </div>
        )}

        <SquareButton
          disabled={sending || success || (!isValid && isDirty)}
          type='submit'
          className='w-full mt-4'
        >
          {t('send')}
        </SquareButton>
      </form>

      <div
        className={classNames('mt-10 text-centered', {
          hidden: !success
        })}
      >
        <p className='text-sm text-center lg:text-lg my-2 lg:my-8 lg:my-12 text-white w-10/12 lg:w-3/4 m-auto'>
          🙂 {t('thanksForTheFeedback')}
        </p>
      </div>
    </>
  )
}
