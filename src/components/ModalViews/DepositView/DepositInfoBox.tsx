import { InfoListItem } from '@components/InfoList'
import { PrizePoolNetworkAPRItem } from '@components/InfoList/PrizePoolNetworkAPRItem'
import { PrizePoolYieldSourceItem } from '@components/InfoList/PrizePoolYieldSourceItem'
import { TicketBalanceListItem } from '@components/InfoList/TicketBalanceListItem'
import { TwabRewardsAprItem } from '@components/InfoList/TwabRewardsAprItem'
import { UpdatedPrizePoolNetworkOddsListItem } from '@components/InfoList/UpdatedPrizePoolNetworkOddsListItem'
import { UpdatedPrizePoolOddsListItem } from '@components/InfoList/UpdatedPrizePoolOddsListItem'
import { UpdatedPrizePoolOddsListItemBar } from '@components/InfoList/UpdatedPrizePoolOddsListItemBar'
import { PrizePoolLabelFlat } from '@components/PrizePool/PrizePoolLabel'
import { EstimateAction } from '@constants/odds'
import { useFormTokenAmount } from '@hooks/useFormTokenAmount'
import { useSelectedPrizePool } from '@hooks/v4/PrizePool/useSelectedPrizePool'
import { useSelectedPrizePoolTokens } from '@hooks/v4/PrizePool/useSelectedPrizePoolTokens'
import { Transaction, TransactionState } from '@pooltogether/wallet-connection'
import classNames from 'classnames'
import React from 'react'
import { useFormState } from 'react-hook-form'
import { useTranslation } from 'react-i18next'

export const DepositInfoBox: React.FC<{
  formKey: string
  transaction: Transaction
  bgClassName?: string
  errorBgClassName?: string
}> = (props) => {
  const { formKey, transaction, bgClassName, errorBgClassName } = props

  const prizePool = useSelectedPrizePool()
  const { data: tokens } = useSelectedPrizePoolTokens()
  const amount = useFormTokenAmount(formKey, tokens?.token)
  const { errors } = useFormState()

  const { t } = useTranslation()
  const errorMessages = errors ? Object.values(errors) : null
  const isError =
    errorMessages &&
    errorMessages.length > 0 &&
    errorMessages[0].message !== '' &&
    transaction?.state !== TransactionState.pending
  const messages = errorMessages?.map((error, index) => (
    <span key={`error-${index}:` + error.message} className='text-pt-red-light'>
      {typeof error.message === 'string' ? error.message : null}
    </span>
  ))

  return (
    <div
      className={classNames('relative rounded-lg px-3 pt-2 pb-1', {
        [bgClassName]: !isError,
        [errorBgClassName]: isError
      })}
    >
      <PrizePoolLabelFlat prizePool={prizePool} className='mb-3' />
      <ul className='w-full mb-2'>
        <TicketBalanceListItem prizePool={prizePool} />
        <UpdatedPrizePoolOddsListItemBar
          prizePool={prizePool}
          action={EstimateAction.deposit}
          amount={amount}
        />
        <UpdatedPrizePoolOddsListItem
          prizePool={prizePool}
          action={EstimateAction.deposit}
          amount={amount}
          nullState={'0'}
          className='w-full'
        />
        <TwabRewardsAprItem />
        <UpdatedPrizePoolNetworkOddsListItem
          amount={amount}
          action={EstimateAction.deposit}
          prizePool={prizePool}
          nullState={'0'}
        />
        <PrizePoolNetworkAPRItem />
        <PrizePoolYieldSourceItem prizePool={prizePool} />

        {isError && (
          <div className='mt-2'>
            <InfoListItem label={t('issues', 'Issues')} value={<div>{messages}</div>} />
          </div>
        )}
      </ul>
    </div>
  )
}
