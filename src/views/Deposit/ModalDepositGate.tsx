import { AmountBeingSwapped } from '@components/AmountBeingSwapped'
import { Token, Amount } from '@pooltogether/hooks'
import {
  SquareLink,
  SquareButton,
  SquareButtonTheme,
  SquareButtonSize,
  ThemedClipSpinner
} from '@pooltogether/react-components'
import {
  formatBlockExplorerTxUrl,
  Transaction,
  TransactionState,
  TransactionStatus
} from '@pooltogether/wallet-connection'
import { DepositLowAmountWarning } from '@views/DepositLowAmountWarning'
import classNames from 'classnames'
import FeatherIcon from 'feather-icons-react'
import { useTranslation } from 'next-i18next'
import React from 'react'

interface ModalDepositGateProps {
  token: Token
  ticket: Token
  amountToDeposit?: Amount
  chainId: number
  approveTx: Transaction
  depositTx: Transaction
  sendApproveTx: () => void
  sendDepositTx: () => void
  className?: string
}

enum Step {
  approve = 'approve',
  deposit = 'deposit'
}

export const ModalDepositGate = (props: ModalDepositGateProps) => {
  const {
    className,
    chainId,
    approveTx,
    depositTx,
    sendApproveTx,
    sendDepositTx,
    amountToDeposit,
    token,
    ticket
  } = props

  const { t } = useTranslation()

  const step = approveTx?.state === TransactionState.pending ? Step.approve : Step.deposit
  const depositTxPendingUser = depositTx?.status === TransactionStatus.pendingUserConfirmation
  const depositTxSent = depositTx?.status === TransactionStatus.pendingBlockchainConfirmation

  return (
    <>
      <AmountBeingSwapped
        isSummary
        title={t('depositTicker', { ticker: token.symbol })}
        chainId={chainId}
        from={token}
        to={ticket}
        amountFrom={amountToDeposit}
        amountTo={amountToDeposit}
      />

      <div className='mb-6'>
        <DepositLowAmountWarning chainId={chainId} amountToDeposit={amountToDeposit} />
      </div>

      <div className={classNames(className, 'flex flex-col pt-4')}>
        <div className='flex'>
          <div className='relative h-10 w-10'>
            <NumberDisplay
              isChecked={step === Step.deposit}
              isLoading={step === Step.approve}
              num={1}
            />
          </div>
          <div className='text-inverse mx-4' style={{ paddingTop: 5 }}>
            <p
              className={classNames('font-bold', {
                'opacity-60 ': step === Step.deposit
              })}
            >
              {t('approveDeposit', 'Approve deposit')}
            </p>

            {step === Step.approve &&
              approveTx &&
              approveTx?.status === TransactionStatus.pendingUserConfirmation && (
                <p className=' '>
                  <span className='opacity-60'>
                    {t('youllBeAskedToApproveThisDepositFromWallet')} {t('forMoreInfoOnApprovals')}{' '}
                  </span>
                  <a
                    target='_blank'
                    className='underline dark:text-pt-teal transition opacity-60 hover:opacity-100'
                    href='https://docs.pooltogether.com/pooltogether/using-pooltogether'
                    rel='noreferrer'
                  >
                    {t('howToDeposit', 'How to deposit')}
                  </a>
                </p>
              )}

            {step === Step.approve &&
              approveTx &&
              approveTx?.status === TransactionStatus.pendingBlockchainConfirmation && (
                <SquareLink
                  href={formatBlockExplorerTxUrl(approveTx.response?.hash, chainId)}
                  className='mt-2'
                  theme={SquareButtonTheme.tealOutline}
                  size={SquareButtonSize.sm}
                  target='_blank'
                >
                  {t('viewReceipt', 'View receipt')}
                </SquareLink>
              )}
          </div>
        </div>

        <div className='flex mt-4'>
          <div className='relative h-10 w-10'>
            <NumberDisplay isLoading={depositTxPendingUser || depositTxSent} num={2} />
          </div>
          <div className='text-inverse mx-4' style={{ paddingTop: 5 }}>
            <p className='font-bold'>{t('confirmDeposit', 'Confirm deposit')}</p>

            {step === Step.deposit && !depositTxSent && (
              <p className='opacity-60 '>
                {t('youllBeAskedToReviewAndConfirmThisDepositFromWallet')}
              </p>
            )}

            {step === Step.deposit &&
              depositTx &&
              depositTx?.status === TransactionStatus.cancelled && (
                <SquareButton className='mt-2' onClick={sendDepositTx}>
                  {t('continue', 'Continue')}
                </SquareButton>
              )}

            {step === Step.deposit &&
              depositTx &&
              depositTx?.status === TransactionStatus.pendingBlockchainConfirmation && (
                <SquareLink
                  href={formatBlockExplorerTxUrl(depositTx.response?.hash, chainId)}
                  className='mt-2'
                  theme={SquareButtonTheme.tealOutline}
                  size={SquareButtonSize.sm}
                  target='_blank'
                >
                  {t('viewReceipt', 'View receipt')}
                </SquareLink>
              )}
          </div>
        </div>
      </div>
    </>
  )
}

const NumberDisplay = (props) => {
  return (
    <>
      {props.isChecked ? (
        <div
          className='absolute inset-0 flex justify-center text-lg font-bold border-2 border-pt-teal rounded-full h-10 w-10'
          style={{ paddingTop: 9 }}
        >
          <FeatherIcon icon='check' className={'relative w-5 h-5'} />
        </div>
      ) : (
        <div
          className='absolute inset-0 flex justify-center text-lg font-bold border-2 border-pt-purple-lighter rounded-full h-10 w-10 border-opacity-10'
          style={{ paddingTop: 2 }}
        >
          {props.num}
        </div>
      )}

      {props.isLoading ? (
        <ThemedClipSpinner className='mx-auto' sizeClassName='w-10 h-10' />
      ) : (
        <div className='mx-auto w-10 h-10' />
      )}
    </>
  )
}
