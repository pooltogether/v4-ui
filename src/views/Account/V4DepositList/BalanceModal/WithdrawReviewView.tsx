import {
  ReviewTransactionView,
  ReviewTransactionViewProps
} from '@components/ModalViews/ReviewTransactionView'

export const WithdrawReviewView: React.FC<ReviewTransactionViewProps> = (props) => {
  const { withdrawAmount, ...reviewViewProps } = props

  return <ReviewTransactionView {...reviewViewProps} amount={withdrawAmount} />
}
