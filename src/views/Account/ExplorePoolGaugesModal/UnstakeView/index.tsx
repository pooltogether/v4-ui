import {
  TokenAmountFormValues,
  TokenAmountInputFormView
} from '@components/ModalViews/TokenAmountInputFormView'
import { useGaugeController } from '@hooks/v4/Gauge/useGaugeControllers'
import { useGaugeToken } from '@hooks/v4/Gauge/useGaugeToken'
import { useUnstakeValidationRules } from '@hooks/v4/Gauge/useUnstakeValidationRules'
import { usePrizeDistributorByChainId } from '@hooks/v4/PrizeDistributor/usePrizeDistributorByChainId'
import { useSelectedPrizePool } from '@hooks/v4/PrizePool/useSelectedPrizePool'
import { Amount } from '@pooltogether/hooks'
import { ViewProps } from '@pooltogether/react-components'
import { Transaction } from '@pooltogether/wallet-connection'
import { getAmountFromString } from '@utils/getAmountFromString'
import { ViewIds } from '..'
import { UnstakeInfoListItems } from './UnstakeInfoListItems'

const FORM_KEY = 'unstakeAmount'

export const UnstakeView: React.FC<
  {
    unstakeAmount: Amount
    setUnstakeAmount: (amount: Amount) => void
    transaction?: Transaction
  } & ViewProps
> = (props) => {
  const {
    previous,
    next,
    setSelectedViewId,
    unstakeAmount,
    setUnstakeAmount,
    transaction,
    viewIds
  } = props
  const prizePool = useSelectedPrizePool()

  const prizeDistributor = usePrizeDistributorByChainId(prizePool.chainId)
  const { data: gaugeController } = useGaugeController(prizeDistributor)
  const { data: token } = useGaugeToken(gaugeController)

  return (
    <TokenAmountInputFormView
      formKey={FORM_KEY}
      previous={previous}
      next={next}
      setSelectedViewId={setSelectedViewId}
      viewIds={viewIds}
      infoListItems={<UnstakeInfoListItems formKey={FORM_KEY} transaction={transaction} />}
      connectWallet={() => setSelectedViewId(ViewIds.walletConnection)}
      useValidationRules={() => useUnstakeValidationRules(prizePool)}
      handleSubmit={(values: TokenAmountFormValues) => {
        setUnstakeAmount(getAmountFromString(values[FORM_KEY], token?.decimals))
        setSelectedViewId(ViewIds.unstakeReview)
      }}
      // carouselChildren={[]}
      chainId={prizePool.chainId}
      token={token}
      defaultValue={unstakeAmount?.amount}
    ></TokenAmountInputFormView>
  )
}
