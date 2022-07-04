import {
  ReviewTransactionModalView,
  ReviewTransactionModalViewProps
} from '@components/ModalViews/ReviewTransactionModalView'
import { usePrizePoolTokens } from '@hooks/v4/PrizePool/usePrizePoolTokens'
import { useSelectedPrizePool } from '@hooks/v4/PrizePool/useSelectedPrizePool'

export const DepositReviewTransactionModalView: React.FC<ReviewTransactionModalViewProps> = (
  props
) => {
  const { depositAmount, ...reviewViewProps } = props

  const prizePool = useSelectedPrizePool()
  const { data: tokenData } = usePrizePoolTokens(prizePool)

  return (
    <ReviewTransactionModalView
      {...reviewViewProps}
      amount={depositAmount}
      spenderAddress={prizePool.address}
      tokenAddress={tokenData?.token.address}
    />
  )
}
