import { InfoListItem } from '@components/InfoList'
import { Transaction, TransactionState } from '@pooltogether/wallet-connection'
import { useFormState } from 'react-hook-form'
import { useTranslation } from 'react-i18next'

export const StakeInfoListItems: React.FC<{ formKey: string; transaction: Transaction }> = (
  props
) => {
  const { formKey, transaction } = props
  return (
    <>
      <ErrorItem transaction={transaction} key='error-item' />
      <div>Stake POOL to earn!</div>
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
