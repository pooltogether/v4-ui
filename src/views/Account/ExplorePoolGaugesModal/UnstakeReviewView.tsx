import {
  ReviewTransactionView,
  ReviewTransactionViewProps
} from '@components/ModalViews/ReviewTransactionView'
import { usePrizePoolTokens } from '@hooks/v4/PrizePool/usePrizePoolTokens'
import { useSelectedPrizePool } from '@hooks/v4/PrizePool/useSelectedPrizePool'
import { Amount } from '@pooltogether/hooks'
import { Transaction } from '@pooltogether/wallet-connection'

export const UnstakeReviewView: React.FC<
  {
    reviewView?: React.ReactNode
    successView?: React.ReactNode
    unstakeAmount: Amount
    unstakeTransaction: Transaction
    sendUnstakeTransaction: () => void
    clearUnstakeTransaction: () => void
  } & ReviewTransactionViewProps
> = (props) => {
  const {
    reviewView,
    successView,
    unstakeAmount,
    unstakeTransaction,
    sendUnstakeTransaction,
    clearUnstakeTransaction,
    ...reviewViewProps
  } = props

  const prizePool = useSelectedPrizePool()
  const { data: tokenData } = usePrizePoolTokens(prizePool)

  return (
    <ReviewTransactionView
      {...reviewViewProps}
      amount={unstakeAmount}
      transaction={unstakeTransaction}
      sendTransaction={sendUnstakeTransaction}
      clearTransaction={clearUnstakeTransaction}
      spenderAddress={prizePool.address}
      tokenAddress={tokenData?.token.address}
      reviewView={
        <div className='flex flex-col space-y-4'>
          <div>Unstake review content goes here</div>
          {reviewView}
        </div>
      }
      successView={
        <div className='flex flex-col space-y-4'>
          <div>Successful unstake content goes here</div>
          {successView}
        </div>
      }
    />
  )
}
