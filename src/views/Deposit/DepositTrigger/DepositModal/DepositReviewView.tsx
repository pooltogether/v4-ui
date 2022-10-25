import { DepositReviewView as DepositReviewViewCore } from '@components/ModalViews/DepositReviewView'
import { ReviewTransactionViewProps } from '@components/ModalViews/ReviewTransactionView'
import { Amount } from '@pooltogether/hooks'
import { Transaction } from '@pooltogether/wallet-connection'
import { useRouter } from 'next/router'
import { useTranslation } from 'react-i18next'

export const DepositReviewView: React.FC<
  {
    depositAmount: Amount
    depositTransaction: Transaction
    sendDepositTransaction: () => void
    clearDepositTransaction: () => void
  } & ReviewTransactionViewProps
> = (props) => {
  const { t } = useTranslation()
  const router = useRouter()

  return <DepositReviewViewCore {...props} />
}
