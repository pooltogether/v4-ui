import {
  TokenAmountFormValues,
  TokenAmountInputFormView
} from '@components/ModalViews/TokenAmountInputFormView'
import { useSelectedPrizePool } from '@hooks/v4/PrizePool/useSelectedPrizePool'
import { useSelectedPrizePoolTokens } from '@hooks/v4/PrizePool/useSelectedPrizePoolTokens'
import { useWithdrawValidationRules } from '@hooks/v4/PrizePool/useWithdrawValidationRules'
import { Amount } from '@pooltogether/hooks'
import { ViewProps } from '@pooltogether/react-components'
import { getAmount } from '@pooltogether/utilities'
import { Transaction } from '@pooltogether/wallet-connection'
import { useTranslation } from 'next-i18next'
import { WithdrawInfoListItems } from './WithdrawInfoListItems'
import { ViewIds } from '..'

const FORM_KEY = 'withdrawAmount'

export const WithdrawView: React.FC<
  {
    withdrawAmount: Amount
    setWithdrawAmount: (amount: Amount) => void
    withdrawTransaction?: Transaction
  } & ViewProps
> = (props) => {
  const {
    previous,
    next,
    setSelectedViewId,
    withdrawAmount,
    setWithdrawAmount,
    transaction,
    viewIds,
    ...remainingProps
  } = props
  const prizePool = useSelectedPrizePool()
  const { data: tokens } = useSelectedPrizePoolTokens()
  const useValidationRules = () => useWithdrawValidationRules(prizePool)
  const { t } = useTranslation()

  return (
    <TokenAmountInputFormView
      {...remainingProps}
      submitButtonContent={t('reviewWithdrawal')}
      formKey={FORM_KEY}
      previous={previous}
      next={next}
      setSelectedViewId={setSelectedViewId}
      viewIds={viewIds}
      infoListItems={
        <WithdrawInfoListItems transaction={transaction} withdrawAmount={withdrawAmount} />
      }
      useValidationRules={useValidationRules}
      handleSubmit={(values: TokenAmountFormValues) => {
        setWithdrawAmount(getAmount(values[FORM_KEY], tokens?.token.decimals))
        setSelectedViewId(ViewIds.withdrawReview)
      }}
      chainId={prizePool.chainId}
      token={tokens?.ticket}
      defaultValue={withdrawAmount?.amount}
    />
  )
}
