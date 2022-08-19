import { ReviewTransactionViewProps } from '@components/ModalViews/ReviewTransactionView'
import { Amount } from '@pooltogether/hooks'
import { ButtonLink, ButtonSize, ButtonTheme } from '@pooltogether/react-components'
import Link from 'next/link'
import { useRouter } from 'next/router'
import { useTranslation } from 'react-i18next'
import { DepositReviewView as DepositReviewViewCore } from '@components/ModalViews/DepositReviewView'
import { Transaction } from '@pooltogether/wallet-connection'

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

  return (
    <DepositReviewViewCore
      {...props}
      successView={
        <Link href={{ pathname: '/account', query: router.query }}>
          <ButtonLink
            size={ButtonSize.md}
            theme={ButtonTheme.tealOutline}
            className='w-full text-center'
          >
            {t('viewAccount', 'View account')}
          </ButtonLink>
        </Link>
      }
    />
  )
}
