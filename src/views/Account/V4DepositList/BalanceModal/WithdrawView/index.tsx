import {
  FORM_KEY,
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

export const WithdrawView: React.FC<
  { setDepositAmount: (amount: Amount) => void; transaction?: Transaction } & ViewProps
> = (props) => {
  const {
    previous,
    next,
    setSelectedViewId,
    depositAmount,
    setDepositAmount,
    transaction,
    viewIds
  } = props
  const prizePool = useSelectedPrizePool()
  const { data: tokens } = useSelectedPrizePoolTokens()

  return (
    <TokenAmountInputFormView
      previous={previous}
      next={next}
      setSelectedViewId={setSelectedViewId}
      viewIds={viewIds}
      infoListItems={<WithdrawInfoListItems transaction={transaction} />}
      useValidationRules={() => {
        return {}
      }}
      handleSubmit={(values: TokenAmountFormValues) => {
        setDepositAmount(getAmountFromString(values[FORM_KEY.amount], tokens?.token.decimals))
        setSelectedViewId(ViewIds.withdrawReview)
      }}
      carouselChildren={[<PrizeBreakdownCard key='prize-breakdown-card' />]}
      chainId={prizePool.chainId}
      token={tokens?.token}
      defaultValue={depositAmount?.amount}
    ></TokenAmountInputFormView>
  )
}
