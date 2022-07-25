import {
  ReviewTransactionView,
  ReviewTransactionViewProps
} from '@components/ModalViews/ReviewTransactionView'
import { usePrizePoolTokens } from '@hooks/v4/PrizePool/usePrizePoolTokens'
import { useSelectedPrizePool } from '@hooks/v4/PrizePool/useSelectedPrizePool'

export const DepositReviewTransactionView: React.FC<ReviewTransactionViewProps> = (props) => {
  const { depositAmount, ...reviewViewProps } = props

  const prizePool = useSelectedPrizePool()
  const { data: tokenData } = usePrizePoolTokens(prizePool)

  return (
    <ReviewTransactionView
      {...reviewViewProps}
      amount={depositAmount}
      spenderAddress={prizePool.address}
      tokenAddress={tokenData?.token.address}
    />
  )
}
