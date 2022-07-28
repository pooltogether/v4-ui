import { InfoListItem } from '@components/InfoList'
import { EstimatedAPRItem } from '@components/InfoList/EstimatedAPRItem'
import {
  EstimatedApproveAndDepositGasItem,
  EstimatedDepositGasItem
} from '@components/InfoList/EstimatedGasItem'
import { useFormTokenAmount } from '@hooks/useFormTokenAmount'
import { useSelectedPrizePool } from '@hooks/v4/PrizePool/useSelectedPrizePool'
import { useSelectedPrizePoolTokens } from '@hooks/v4/PrizePool/useSelectedPrizePoolTokens'
import { useUsersDepositAllowance } from '@hooks/v4/PrizePool/useUsersDepositAllowance'
import { Transaction, TransactionState } from '@pooltogether/wallet-connection'
import { useFormState } from 'react-hook-form'
import { useTranslation } from 'react-i18next'

export const DepositInfoListItems: React.FC<{ formKey: string; transaction: Transaction }> = (
  props
) => {
  const { formKey, transaction } = props

  const prizePool = useSelectedPrizePool()
  const { data: tokens } = useSelectedPrizePoolTokens()
  const { data: depositAllowance } = useUsersDepositAllowance(prizePool)
  const amount = useFormTokenAmount(formKey, tokens?.token)

  return (
    <>
      <ErrorItem transaction={transaction} key='error-item' />
      <EstimatedAPRItem prizePool={prizePool} key='apr-item' />
      {depositAllowance?.gt(0) ? (
        <EstimatedDepositGasItem
          chainId={prizePool.chainId}
          amountUnformatted={amount?.amountUnformatted}
          key='deposit-gas-item'
        />
      ) : (
        <EstimatedApproveAndDepositGasItem
          chainId={prizePool.chainId}
          amountUnformatted={amount?.amountUnformatted}
          key='deposit-and-approve-gas-item'
        />
      )}
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
