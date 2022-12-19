import { ExpectedPrizeBreakdown } from '@components/ModalViews/DepositView/ExpectedPrizeBreakdown'
import {
  TokenAmountFormValues,
  TokenAmountInputFormView
} from '@components/ModalViews/TokenAmountInputFormView'
import { useDepositValidationRules } from '@hooks/v4/PrizePool/useDepositValidationRules'
import { useSelectedPrizePool } from '@hooks/v4/PrizePool/useSelectedPrizePool'
import { useSelectedPrizePoolTokens } from '@hooks/v4/PrizePool/useSelectedPrizePoolTokens'
import { useUpcomingPrizeTier } from '@hooks/v4/PrizePool/useUpcomingPrizeTier'
import { Amount } from '@pooltogether/hooks'
import { ViewProps } from '@pooltogether/react-components'
import { getAmount } from '@pooltogether/utilities'
import { Transaction } from '@pooltogether/wallet-connection'
import { ReactElement } from 'react'
import { useTranslation } from 'react-i18next'
import { DepositInfoBox } from './DepositInfoBox'
import { PrizeFrequencyBreakdown } from './PrizeFrequencyBreakdown'

/**
 * Handles passing default values to the TokenAmountInputFormView for depositing into V4 prize pools.
 * @param props
 * @returns
 */
export const DepositView: React.FC<
  {
    depositAmount: Amount
    defaultValue: string
    setDepositAmount: (amount: Amount) => void
    setFormAmount: (amount: string) => void
    transaction?: Transaction
    formKey: string
    connectWallet?: () => void
    onSubmit?: () => void
  } & ViewProps
> = (props) => {
  const {
    depositAmount,
    defaultValue,
    setDepositAmount,
    setFormAmount,
    transaction,
    formKey,
    connectWallet,
    onSubmit,
    ...remainingProps
  } = props
  const prizePool = useSelectedPrizePool()
  const { data: tokens } = useSelectedPrizePoolTokens()
  const { data: prizeTierData, isFetched: isPrizeTierFetched } = useUpcomingPrizeTier(prizePool)
  const { t } = useTranslation()

  const useValidationRules = () => useDepositValidationRules(prizePool)

  const carouselChildren: ReactElement[] = [
    <DepositInfoBox
      key='deposit-info-box'
      formKey={formKey}
      transaction={transaction}
      bgClassName='bg-white bg-opacity-100 dark:bg-actually-black dark:bg-opacity-10 transition-opacity'
      errorBgClassName='bg-white bg-opacity-50 dark:bg-actually-black dark:bg-opacity-30 transition-opacity'
    />,
    <ExpectedPrizeBreakdown key='prize-breakdown' formKey={formKey} className='mx-auto' />
  ]

  if (
    isPrizeTierFetched &&
    'dpr' in prizeTierData.prizeTier &&
    prizeTierData.prizeTier.dpr !== undefined
  ) {
    carouselChildren.push(
      <PrizeFrequencyBreakdown
        key='prize-freq-breakdown'
        formKey={formKey}
        prizeTier={prizeTierData.prizeTier}
      />
    )
  }

  return (
    <TokenAmountInputFormView
      {...remainingProps}
      submitButtonContent={t('reviewDeposit')}
      formKey={formKey}
      connectWallet={connectWallet}
      useValidationRules={useValidationRules}
      handleChange={(values: TokenAmountFormValues) => {
        setFormAmount(values[formKey].toString())
      }}
      handleSubmit={(values: TokenAmountFormValues) => {
        setDepositAmount(getAmount(values[formKey], tokens?.token.decimals))
        onSubmit?.()
      }}
      carouselChildren={carouselChildren}
      chainId={prizePool.chainId}
      token={tokens?.token}
      defaultValue={defaultValue}
    />
  )
}
