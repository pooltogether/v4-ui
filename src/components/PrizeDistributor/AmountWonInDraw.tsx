import { CurrencyValue } from '@components/CurrencyValue'
import { useDrawWinnersInfo } from '@hooks/v4/useDrawWinnersInfo'
import { PrizeDistributor } from '@pooltogether/v4-client-js'

// TODO: Assumes stablecoins
export const AmountWonInDraw = (props: { prizeDistributor: PrizeDistributor; drawId: number }) => {
  const { prizeDistributor, drawId } = props
  const { data: winnersInfo, isFetched } = useDrawWinnersInfo(prizeDistributor, drawId)
  return <>{isFetched && <CurrencyValue usdValue={winnersInfo.amount.amount} />}</>
}
