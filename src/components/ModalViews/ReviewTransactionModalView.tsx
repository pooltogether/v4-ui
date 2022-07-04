import { AmountBeingSwapped } from '@components/AmountBeingSwapped'
import { AnimatedBorderCard } from '@components/AnimatedCard'
import { ModalInfoList } from '@components/InfoList'
import { EstimatedAPRItem } from '@components/InfoList/EstimatedAPRItem'
import { EstimatedDepositGasItems } from '@components/InfoList/EstimatedGasItem'
import { TxButton } from '@components/Input/TxButton'
import { TransactionReceiptButton } from '@components/TransactionReceiptButton'
import { useSelectedChainId } from '@hooks/useSelectedChainId'
import { usePrizePoolTokens } from '@hooks/v4/PrizePool/usePrizePoolTokens'
import { useSelectedPrizePool } from '@hooks/v4/PrizePool/useSelectedPrizePool'
import { Amount, useTokenAllowance } from '@pooltogether/hooks'
import {
  Button,
  ButtonLink,
  ButtonSize,
  ButtonTheme,
  ModalTitle,
  ViewProps
} from '@pooltogether/react-components'
import { msToS } from '@pooltogether/utilities'
import {
  Transaction,
  TransactionStatus,
  useApproveErc20,
  useTransaction,
  useUsersAddress
} from '@pooltogether/wallet-connection'
import { addDays } from '@utils/date'
import { getTimestampString } from '@utils/getTimestampString'
import { ModalApproveGate } from '@views/Deposit/ModalApproveGate'
import { ModalLoadingGate } from '@views/Deposit/ModalLoadingGate'
import { DepositLowAmountWarning } from '@views/DepositLowAmountWarning'
import Link from 'next/link'
import { useRouter } from 'next/router'
import { useState } from 'react'
import { Trans, useTranslation } from 'react-i18next'

export interface ReviewTransactionModalViewProps extends ViewProps {
  transaction: Transaction
  sendTransaction: () => void
  setApproveTransactionId?: (id: string) => void
  spenderAddress?: string
  tokenAddress?: string
  amount?: Amount
}

/**
 * Includes option ERC20 token approval support. The view will add an additional stepper and approve step to the view so users are carried through the approval process when necessary.
 * @param props
 * @returns
 */
export const ReviewTransactionModalView: React.FC<ReviewTransactionModalViewProps> = (props) => {
  const {
    previous,
    sendTransaction,
    transaction,
    amount,
    spenderAddress,
    tokenAddress,
    setApproveTransactionId: _setApproveTransactionId
  } = props
  const { chainId } = useSelectedChainId()
  const prizePool = useSelectedPrizePool()
  const usersAddress = useUsersAddress()

  const {
    data: allowanceUnformatted,
    isFetched: isTokenAllowanceFetched,
    isIdle
  } = useTokenAllowance(chainId, usersAddress, spenderAddress, tokenAddress)
  const [approveTransactionId, setApproveTransactionId] = useState('')
  const approveTransaction = useTransaction(approveTransactionId)
  const _sendApproveTx = useApproveErc20(tokenAddress, spenderAddress)
  const { data: tokenData, isFetched: isTokensFetched } = usePrizePoolTokens(prizePool)
  const amountUnformatted = amount?.amountUnformatted

  const sendApproveTx = async () => {
    const transactionId = await _sendApproveTx()
    setApproveTransactionId(transactionId)
    _setApproveTransactionId?.(transactionId)
  }

  const { t } = useTranslation()

  if (!isTokensFetched || (!isIdle && !isTokenAllowanceFetched)) {
    return (
      <>
        <ModalLoadingGate className='mt-8' />
      </>
    )
  } else if (!isIdle && amountUnformatted && allowanceUnformatted?.lt(amountUnformatted)) {
    return (
      <>
        <ModalApproveGate
          amountToDeposit={amount}
          chainId={chainId}
          approveTx={approveTransaction}
          sendApproveTx={sendApproveTx}
          className='mt-8'
        />
      </>
    )
  } else if (transaction?.status === TransactionStatus.error) {
    return (
      <>
        <p className='my-2 text-accent-1 text-center mx-8'>😔 {t('ohNo', 'Oh no')}!</p>
        <p className='mb-8 text-accent-1 text-center mx-8'>
          {t(
            'somethingWentWrongWhileProcessingYourTransaction',
            'Something went wrong while processing your transaction.'
          )}
        </p>
        <Button theme={ButtonTheme.tealOutline} className='w-full' onClick={previous}>
          {t('tryAgain', 'Try again')}
        </Button>
      </>
    )
  } else if (
    transaction?.status === TransactionStatus.pendingBlockchainConfirmation ||
    transaction?.status === TransactionStatus.success
  ) {
    return (
      <>
        {prizePool && <CheckBackForPrizesBox />}
        <TransactionReceiptButton className='mt-8 w-full' chainId={chainId} tx={transaction} />
        <AccountPageButton />
      </>
    )
  }

  return (
    <>
      <div className='w-full mx-auto mt-8 space-y-8'>
        <p className='text-center text-xs'>
          <Trans
            i18nKey='checkDailyForMoreInfoSeeHere'
            components={{
              a: (
                <a
                  href='https://docs.pooltogether.com/faq/prizes-and-winning'
                  target='_blank'
                  rel='noopener noreferrer'
                  className='text-highlight-1 hover:opacity-70 transition-opacity'
                />
              )
            }}
          />
        </p>
        <AmountBeingSwapped
          title={t('depositTicker', { ticker: tokenData.token.symbol })}
          chainId={chainId}
          from={tokenData.token}
          to={tokenData.ticket}
          amountFrom={amount}
          amountTo={amount}
        />

        {prizePool && (
          <>
            <DepositLowAmountWarning chainId={chainId} amountToDeposit={amount} />

            <ModalInfoList>
              {prizePool && (
                <>
                  <EstimatedAPRItem prizePool={prizePool} />
                  {/* // TODO: Add back odds from main branch */}
                </>
              )}
              <EstimatedDepositGasItems chainId={chainId} amountUnformatted={amountUnformatted} />
            </ModalInfoList>
          </>
        )}

        <TxButton
          className='mt-8 w-full'
          chainId={chainId}
          onClick={sendTransaction}
          state={transaction?.state}
          status={transaction?.status}
        >
          {t('confirmDeposit', 'Confirm deposit')}
        </TxButton>
      </div>
    </>
  )
}

const CheckBackForPrizesBox = () => {
  const { t } = useTranslation()
  const eligibleDate = getTimestampString(msToS(addDays(new Date(), 2).getTime()))

  return (
    <AnimatedBorderCard className='flex flex-col text-center'>
      <div className='mb-2'>
        {t('disclaimerComeBackRegularlyToClaimWinnings', { date: eligibleDate })}
      </div>

      <a
        href='https://docs.pooltogether.com/faq/prizes-and-winning'
        target='_blank'
        rel='noopener noreferrer'
        className='underline text-xs'
      >
        {t('learnMore', 'Learn more')}
      </a>
    </AnimatedBorderCard>
  )
}

export const AccountPageButton = () => {
  const { t } = useTranslation()
  const router = useRouter()
  return (
    <Link href={{ pathname: '/account', query: router.query }}>
      <ButtonLink
        size={ButtonSize.md}
        theme={ButtonTheme.tealOutline}
        className='w-full text-center'
      >
        {t('viewAccount', 'View account')}
      </ButtonLink>
    </Link>
  )
}
