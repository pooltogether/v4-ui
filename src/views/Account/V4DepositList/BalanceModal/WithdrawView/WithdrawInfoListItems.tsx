import { InfoListItem } from '@components/InfoList'
import { EstimatedAPRItem } from '@components/InfoList/EstimatedAPRItem'
import { PrizePoolNetworkAPRItem } from '@components/InfoList/PrizePoolNetworkAPRItem'
import { TwabRewardsAprItem } from '@components/InfoList/TwabRewardsAprItem'
import { UpdatedPrizePoolNetworkOddsListItem } from '@components/InfoList/UpdatedPrizePoolNetworkOddsListItem'
import { UpdatedPrizePoolOddsListItem } from '@components/InfoList/UpdatedPrizePoolOddsListItem'
import { EstimateAction } from '@constants/odds'
import { useSelectedPrizePool } from '@hooks/v4/PrizePool/useSelectedPrizePool'
import { Amount } from '@pooltogether/hooks'
import { Transaction, TransactionState } from '@pooltogether/wallet-connection'
import { useFormState } from 'react-hook-form'
import { useTranslation } from 'react-i18next'

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
        nullState={'-'}
        className='w-full'
      />
      <TwabRewardsAprItem />
      <UpdatedPrizePoolNetworkOddsListItem
        amount={withdrawAmount}
        action={EstimateAction.withdraw}
        prizePool={prizePool}
        nullState={'-'}
      />
      <PrizePoolNetworkAPRItem />
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
