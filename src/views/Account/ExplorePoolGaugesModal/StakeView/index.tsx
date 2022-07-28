import {
  TokenAmountFormValues,
  TokenAmountInputFormView
} from '@components/ModalViews/TokenAmountInputFormView'
import { useGaugeController } from '@hooks/v4/Gauge/useGaugeControllers'
import { useGaugeToken } from '@hooks/v4/Gauge/useGaugeToken'
import { useStakeValidationRules } from '@hooks/v4/Gauge/useStakeValidationRules'
import { usePrizeDistributorByChainId } from '@hooks/v4/PrizeDistributor/usePrizeDistributorByChainId'
import { useSelectedPrizePool } from '@hooks/v4/PrizePool/useSelectedPrizePool'
import { Amount } from '@pooltogether/hooks'
import { ViewProps } from '@pooltogether/react-components'
import { Transaction } from '@pooltogether/wallet-connection'
import { getAmountFromString } from '@utils/getAmountFromString'
import { ViewIds } from '..'
import { StakeInfoListItems } from './StakeInfoListItems'

const FORM_KEY = 'stakeAmount'

export const StakeView: React.FC<
  {
    stakeAmount: Amount
    setStakeAmount: (amount: Amount) => void
    transaction?: Transaction
  } & ViewProps
> = (props) => {
  const { previous, next, setSelectedViewId, stakeAmount, setStakeAmount, transaction, viewIds } =
    props
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
      infoListItems={<StakeInfoListItems formKey={FORM_KEY} transaction={transaction} />}
      connectWallet={() => setSelectedViewId(ViewIds.walletConnection)}
      useValidationRules={() => useStakeValidationRules(prizePool)}
      handleSubmit={(values: TokenAmountFormValues) => {
        setStakeAmount(getAmountFromString(values[FORM_KEY], token?.decimals))
        setSelectedViewId(ViewIds.stakeReview)
      }}
      // carouselChildren={[]}
      chainId={prizePool.chainId}
      token={token}
      defaultValue={stakeAmount?.amount}
    ></TokenAmountInputFormView>
  )
}
