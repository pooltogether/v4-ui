import { AmountBeingSwapped } from '@components/AmountBeingSwapped'
import { AnimatedBorderCard } from '@components/AnimatedCard'
import { ModalInfoList } from '@components/InfoList'
import { EstimatedDepositGasItems } from '@components/InfoList/EstimatedGasItem'
import { PrizePoolNetworkAPRItem } from '@components/InfoList/PrizePoolNetworkAPRItem'
import { TwabRewardsAprItem } from '@components/InfoList/TwabRewardsAprItem'
import { UpdatedPrizePoolNetworkOddsListItem } from '@components/InfoList/UpdatedPrizePoolNetworkOddsListItem'
import { UpdatedPrizePoolOddsListItem } from '@components/InfoList/UpdatedPrizePoolOddsListItem'
import {
  ReviewTransactionView,
  ReviewTransactionViewProps
} from '@components/ModalViews/ReviewTransactionView'
import { EstimateAction } from '@constants/odds'
import { useSelectedChainId } from '@hooks/useSelectedChainId'
import { usePrizePoolTokens } from '@hooks/v4/PrizePool/usePrizePoolTokens'
import { useSelectedPrizePool } from '@hooks/v4/PrizePool/useSelectedPrizePool'
import { Amount } from '@pooltogether/hooks'
import { msToS } from '@pooltogether/utilities'
import { Transaction } from '@pooltogether/wallet-connection'
import { addDays } from '@utils/date'
import { getTimestampString } from '@utils/getTimestampString'
import { DepositLowAmountWarning } from '@views/DepositLowAmountWarning'
import { Trans, useTranslation } from 'react-i18next'

export const DepositReviewView: React.FC<
  {
    reviewView?: React.ReactNode
    successView?: React.ReactNode
    depositAmount: Amount
    depositTransaction: Transaction
    sendDepositTransaction: () => void
    clearDepositTransaction: () => void
  } & ReviewTransactionViewProps
> = (props) => {
  const {
    reviewView,
    successView,
    depositAmount,
    depositTransaction,
    sendDepositTransaction,
    clearDepositTransaction,
    ...reviewViewProps
  } = props

  const prizePool = useSelectedPrizePool()
  const { data: tokenData } = usePrizePoolTokens(prizePool)

  return (
    <ReviewTransactionView
      {...reviewViewProps}
      amount={depositAmount}
      transaction={depositTransaction}
      sendTransaction={sendDepositTransaction}
      clearTransaction={clearDepositTransaction}
      spenderAddress={prizePool.address}
      tokenAddress={tokenData?.token.address}
      reviewView={
        <div className='flex flex-col space-y-4'>
          <DepositReviewViewContent depositAmount={depositAmount} />
          {reviewView}
        </div>
      }
      successView={
        <div className='flex flex-col space-y-4'>
          <CheckBackForPrizesBox />
          {successView}
        </div>
      }
    />
  )
}

const DepositReviewViewContent: React.FC<{ depositAmount: Amount }> = (props) => {
  const { depositAmount } = props
  const { t } = useTranslation()
  const { chainId } = useSelectedChainId()
  const prizePool = useSelectedPrizePool()
  const { data: tokenData } = usePrizePoolTokens(prizePool)

  return (
    <div className='flex flex-col space-y-8'>
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
        amountFrom={depositAmount}
        amountTo={depositAmount}
      />
      <DepositLowAmountWarning chainId={chainId} amountToDeposit={depositAmount} />
      <ModalInfoList>
        {prizePool && (
          <>
            <UpdatedPrizePoolOddsListItem
              prizePool={prizePool}
              action={EstimateAction.deposit}
              amount={depositAmount}
              nullState={'0'}
              className='w-full'
            />
            <UpdatedPrizePoolNetworkOddsListItem
              amount={depositAmount}
              action={EstimateAction.deposit}
              prizePool={prizePool}
              nullState={'0'}
            />
            <TwabRewardsAprItem />
            <PrizePoolNetworkAPRItem />
          </>
        )}
        <EstimatedDepositGasItems chainId={chainId} />
      </ModalInfoList>
    </div>
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
        href='https://docs.pooltogether.com/welcome/faq#prizes-and-winning'
        target='_blank'
        rel='noopener noreferrer'
        className='underline text-xs'
      >
        {t('learnMore', 'Learn more')}
      </a>
    </AnimatedBorderCard>
  )
}
