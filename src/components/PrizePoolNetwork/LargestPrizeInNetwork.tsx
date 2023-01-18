import { CurrencyValue } from '@components/CurrencyValue'
import { usePrizePoolNetworkGrandPrize } from '@hooks/v4/PrizePoolNetwork/usePrizePoolNetworkGrandPrize'

/**
 * @param props
 * @returns
 */
export const LargestPrizeInNetwork = (props) => {
  const { data, isFetched } = usePrizePoolNetworkGrandPrize()

  return isFetched ? <CurrencyValue baseValue={data?.grandPrizeValue.amount} /> : null
}
