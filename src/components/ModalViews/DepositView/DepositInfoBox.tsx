import React, { useState } from 'react'
import FeatherIcon from 'feather-icons-react'
import { useTranslation } from 'react-i18next'
import { useFormState } from 'react-hook-form'
import { Transaction, TransactionState } from '@pooltogether/wallet-connection'
import { useUsersDepositAllowance } from '@hooks/v4/PrizePool/useUsersDepositAllowance'
import { InfoListItem } from '@components/InfoList'
import { PrizePoolNetworkAPRItem } from '@components/InfoList/PrizePoolNetworkAPRItem'
import { TwabRewardsAprItem } from '@components/InfoList/TwabRewardsAprItem'
import { useSelectedPrizePool } from '@hooks/v4/PrizePool/useSelectedPrizePool'
import { UpdatedPrizePoolOddsListItem } from '@components/InfoList/UpdatedPrizePoolOddsListItem'
import { EstimateAction } from '@constants/odds'
import classNames from 'classnames'
import { UpdatedPrizePoolNetworkOddsListItem } from '@components/InfoList/UpdatedPrizePoolNetworkOddsListItem'
import { UpdatedPrizePoolOddsListItemBar } from '@components/InfoList/UpdatedPrizePoolOddsListItemBar'
import { useSelectedPrizePoolTokens } from '@hooks/v4/PrizePool/useSelectedPrizePoolTokens'
import { useFormTokenAmount } from '@hooks/useFormTokenAmount'

export const DepositInfoBox: React.FC<{
  formKey: string
  transaction: Transaction
  bgClassName?: string
  errorBgClassName?: string
}> = (props) => {
  const { formKey, transaction, bgClassName, errorBgClassName } = props

  const prizePool = useSelectedPrizePool()
  const { data: tokens } = useSelectedPrizePoolTokens()
  const { data: depositAllowance } = useUsersDepositAllowance(prizePool)
  const amount = useFormTokenAmount(formKey, tokens?.token)
  const [isAdvanced, setIsAdvanced] = useState(false)
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
      {error.message}
    </span>
  ))

  return (
    <div
      className={classNames('relative rounded-lg pl-4 pr-2 py-2', {
        [bgClassName]: !isError,
        [errorBgClassName]: isError
      })}
    >
      <div className={classNames('flex space-x-1 w-full items-center')}>
        <ul className='w-full'>
          {isAdvanced && (
            <>
              <UpdatedPrizePoolOddsListItemBar
                prizePool={prizePool}
                action={EstimateAction.deposit}
                amount={amount}
              />
            </>
          )}
          <UpdatedPrizePoolOddsListItem
            prizePool={prizePool}
            action={EstimateAction.deposit}
            amount={amount}
            // labelClassName={labelClassName}
            // valueClassName={valueClassName}
            nullState={'-'}
            className='w-full'
          />
          <TwabRewardsAprItem
          // labelClassName={labelClassName}
          // valueClassName={valueClassName}
          />
          {isAdvanced && (
            <>
              <UpdatedPrizePoolNetworkOddsListItem
                amount={amount}
                action={EstimateAction.deposit}
                prizePool={prizePool}
                // labelClassName={labelClassName}
                // valueClassName={valueClassName}
                nullState={'-'}
              />
              <PrizePoolNetworkAPRItem
              // labelClassName={labelClassName}
              // valueClassName={valueClassName}
              />
            </>
          )}

          {isError && (
            <div className='mt-2'>
              <InfoListItem
                label={t('issues', 'Issues')}
                value={<div>{messages}</div>}
                // labelClassName={labelClassName}
                // valueClassName={valueClassName}
              />
            </div>
          )}
        </ul>

        <button
          className='flex justify-center w-7'
          type='button'
          onClick={() => setIsAdvanced(!isAdvanced)}
        >
          <FeatherIcon
            icon={isAdvanced ? 'chevron-up' : 'chevron-down'}
            className='w-6 h-6 opacity-50 hover:opacity-100 transition'
          />
        </button>
      </div>
    </div>
  )
}
