import { InfoListItem } from '@components/InfoList'
import { TwabRewardsAprItem } from '@components/InfoList/TwabRewardsAprItem'
import { UpdatedPrizePoolOddsListItem } from '@components/InfoList/UpdatedPrizePoolOddsListItem'
import { EstimateAction } from '@constants/odds'
import { useSelectedPrizePool } from '@hooks/v4/PrizePool/useSelectedPrizePool'
import { Amount } from '@pooltogether/hooks'
import { Transaction, TransactionState } from '@pooltogether/wallet-connection'
import { useFormState } from 'react-hook-form'
import { useTranslation } from 'react-i18next'
import { EstimatedAPRItem } from '../../../../../components/InfoList/EstimatedAPRItem'

export const WithdrawInfoListItems: React.FC<{
  withdrawAmount: Amount
  transaction: Transaction
}> = (props) => {
  const { withdrawAmount, transaction } = props
  const prizePool = useSelectedPrizePool()

  return (
    <>
      <ErrorItem transaction={transaction} key='error-item' />
      <UpdatedPrizePoolOddsListItem
        prizePool={prizePool}
        action={EstimateAction.withdraw}
        amount={withdrawAmount}
        nullState={'0'}
        className='w-full'
      />
      <TwabRewardsAprItem />
      <EstimatedAPRItem prizePool={prizePool} />
    </>
  )
}

const ErrorItem: React.FC<{ transaction: Transaction }> = (props) => {
  const { transaction } = props
  const { errors } = useFormState()
  const { t } = useTranslation()

  const errorMessages = errors ? Object.values(errors) : null
  if (
    errorMessages &&
    errorMessages.length > 0 &&
    errorMessages[0].message !== '' &&
    transaction?.state !== TransactionState.pending
  ) {
    const messages = errorMessages.map((error, index) => (
      <span key={`error-msg-${index}`} className='text-red font-semibold'>
        {typeof error.message === 'string' ? error.message : null}
      </span>
    ))

    return <InfoListItem label={t('issues', 'Issues')} value={<div>{messages}</div>} />
  }
  return null
}
