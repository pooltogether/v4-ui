import {
  TokenAmountFormValues,
  TokenAmountInputFormView
} from '@components/ModalViews/TokenAmountInputFormView'
import { useDepositValidationRules } from '@hooks/v4/PrizePool/useDepositValidationRules'
import { useSelectedPrizePool } from '@hooks/v4/PrizePool/useSelectedPrizePool'
import { useSelectedPrizePoolTokens } from '@hooks/v4/PrizePool/useSelectedPrizePoolTokens'
import { Amount } from '@pooltogether/hooks'
import { ViewProps } from '@pooltogether/react-components'
import { Transaction } from '@pooltogether/wallet-connection'
import { getAmountFromString } from '@utils/getAmountFromString'
import { ViewIds } from '..'
import { DepositInfoListItems } from './DepositInfoListItems'
import { PrizeBreakdownCard } from './PrizeBreakdownCard'

const FORM_KEY = 'depositAmount'

export const DepositView: React.FC<
  { setDepositAmount: (amount: Amount) => void; transaction?: Transaction } & ViewProps
> = (props) => {
  const {
    previous,
    next,
    setSelectedViewId,
    depositAmount,
    setDepositAmount,
    depositTransaction,
    viewIds
  } = props
  const prizePool = useSelectedPrizePool()
  const { data: tokens } = useSelectedPrizePoolTokens()

  return (
    <TokenAmountInputFormView
      formKey={FORM_KEY}
      previous={previous}
      next={next}
      setSelectedViewId={setSelectedViewId}
      viewIds={viewIds}
      infoListItems={<DepositInfoListItems formKey={FORM_KEY} transaction={depositTransaction} />}
      useValidationRules={() => useDepositValidationRules(prizePool)}
      handleSubmit={(values: TokenAmountFormValues) => {
        setDepositAmount(getAmountFromString(values[FORM_KEY], tokens?.token.decimals))
        setSelectedViewId(ViewIds.depositReview)
      }}
      carouselChildren={[<PrizeBreakdownCard key='prize-breakdown-card' />]}
      chainId={prizePool.chainId}
      token={tokens?.token}
      defaultValue={depositAmount?.amount}
    />
  )
}
