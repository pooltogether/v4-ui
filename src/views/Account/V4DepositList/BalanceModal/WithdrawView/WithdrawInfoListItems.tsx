import { InfoListItem } from '@components/InfoList'
import { EstimatedAPRItem } from '@components/InfoList/EstimatedAPRItem'
import { useSelectedPrizePool } from '@hooks/v4/PrizePool/useSelectedPrizePool'
import { Transaction, TransactionState } from '@pooltogether/wallet-connection'
import { useFormState } from 'react-hook-form'
import { useTranslation } from 'react-i18next'

export const WithdrawInfoListItems: React.FC<{ transaction: Transaction }> = (props) => {
  const { transaction } = props
  const prizePool = useSelectedPrizePool()

  return (
    <>
      <ErrorItem transaction={transaction} key='error-item' />
      <EstimatedAPRItem prizePool={prizePool} key='apr-item' />
    </>
  )
}

const ErrorItem: React.FC<{ transaction: Transaction }> = (props) => {
  const { transaction } = props
  const { errors } = useFormState()
  const { t } = useTranslation()

  console.log('errors', { errors, transaction })

  const errorMessages = errors ? Object.values(errors) : null
  if (
    errorMessages &&
    errorMessages.length > 0 &&
    errorMessages[0].message !== '' &&
    transaction?.state !== TransactionState.pending
  ) {
    const messages = errorMessages.map((error) => (
      <span key={error.message} className='text-red font-semibold'>
        {error.message}
      </span>
    ))

    return <InfoListItem label={t('issues', 'Issues')} value={<div>{messages}</div>} />
  }
  return null
}
