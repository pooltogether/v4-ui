import {
  TokenAmountFormValues,
  TokenAmountInputFormView
} from '@components/ModalViews/TokenAmountInputFormView'
import { useSelectedPrizePool } from '@hooks/v4/PrizePool/useSelectedPrizePool'
import { useSelectedPrizePoolTokens } from '@hooks/v4/PrizePool/useSelectedPrizePoolTokens'
import { Amount } from '@pooltogether/hooks'
import { ViewProps } from '@pooltogether/react-components'
import { Transaction } from '@pooltogether/wallet-connection'
import { getAmountFromString } from '@utils/getAmountFromString'
import { ViewIds } from '..'
import { WithdrawInfoListItems } from './WithdrawInfoListItems'
import { PrizeBreakdownCard } from './PrizeBreakdownCard'
import { useWithdrawValidationRules } from '@hooks/v4/PrizePool/useWithdrawValidationRules'

const FORM_KEY = 'withdrawAmount'

export const WithdrawView: React.FC<
  { setWithdrawAmount: (amount: Amount) => void; withdrawTransaction?: Transaction } & ViewProps
> = (props) => {
  const {
    previous,
    next,
    setSelectedViewId,
    withdrawAmount,
    setWithdrawAmount,
    transaction,
    viewIds
  } = props
  const prizePool = useSelectedPrizePool()
  const { data: tokens } = useSelectedPrizePoolTokens()
  const useValidationRules = () => useWithdrawValidationRules(prizePool)

  return (
    <TokenAmountInputFormView
      formKey={FORM_KEY}
      previous={previous}
      next={next}
      setSelectedViewId={setSelectedViewId}
      viewIds={viewIds}
      infoListItems={<WithdrawInfoListItems transaction={transaction} />}
      useValidationRules={useValidationRules}
      handleSubmit={(values: TokenAmountFormValues) => {
        setWithdrawAmount(getAmountFromString(values[FORM_KEY], tokens?.token.decimals))
        setSelectedViewId(ViewIds.withdrawReview)
      }}
      chainId={prizePool.chainId}
      token={tokens?.ticket}
      defaultValue={withdrawAmount?.amount}
    />
  )
}
