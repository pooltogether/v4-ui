import {
  ReviewTransactionView,
  ReviewTransactionViewProps
} from '@components/ModalViews/ReviewTransactionView'
import { usePrizePoolTokens } from '@hooks/v4/PrizePool/usePrizePoolTokens'
import { useSelectedPrizePool } from '@hooks/v4/PrizePool/useSelectedPrizePool'
import { Amount } from '@pooltogether/hooks'
import { Transaction } from '@pooltogether/wallet-connection'

export const StakeReviewView: React.FC<
  {
    reviewView?: React.ReactNode
    successView?: React.ReactNode
    stakeAmount: Amount
    stakeTransaction: Transaction
    sendStakeTransaction: () => void
    clearStakeTransaction: () => void
  } & ReviewTransactionViewProps
> = (props) => {
  const {
    reviewView,
    successView,
    stakeAmount,
    stakeTransaction,
    sendStakeTransaction,
    clearStakeTransaction,
    ...reviewViewProps
  } = props

  const prizePool = useSelectedPrizePool()
  const { data: tokenData } = usePrizePoolTokens(prizePool)

  return (
    <ReviewTransactionView
      {...reviewViewProps}
      amount={stakeAmount}
      transaction={stakeTransaction}
      sendTransaction={sendStakeTransaction}
      clearTransaction={clearStakeTransaction}
      spenderAddress={prizePool.address}
      tokenAddress={tokenData?.token.address}
      reviewView={
        <div className='flex flex-col space-y-4'>
          <div>Stake review content goes here</div>
          {reviewView}
        </div>
      }
      successView={
        <div className='flex flex-col space-y-4'>
          <div>Successful stake content goes here</div>
          {successView}
        </div>
      }
    />
  )
}
