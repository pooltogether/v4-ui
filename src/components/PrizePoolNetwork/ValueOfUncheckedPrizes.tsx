import { PrizeDistributor } from '@pooltogether/v4-client-js'
import { ethers } from 'ethers'
import { useMemo } from 'react'
import { usePrizeDistributorToken } from '../../hooks/v4/PrizeDistributor/usePrizeDistributorToken'
import { useAllDrawWinnersInfo } from '../../hooks/v4/useDrawWinnersInfo'
import { DrawData } from '../../interfaces/v4'
import { roundPrizeAmount } from '../../utils/roundPrizeAmount'
import { CurrencyValue } from '../CurrencyValue'

export const ValueOfUncheckedPrizes = (props: {
  drawDatas: { [drawId: number]: DrawData }
  prizeDistributor: PrizeDistributor
}) => {
  const { drawDatas, prizeDistributor } = props
  const { data: tokenData, isFetched: isTokenDataFetched } =
    usePrizeDistributorToken(prizeDistributor)

  const drawWinnerQueries = useAllDrawWinnersInfo(
    Object.keys(drawDatas)
      .map(Number)
      .map((drawId) => ({ drawId, prizeDistributor }))
  )

  const totalAmount = useMemo(() => {
    if (!isTokenDataFetched) return 0

    const totalAmountUnformatted = drawWinnerQueries
      .filter(({ isFetched, isError }) => isFetched && !isError)
      .reduce((acc, query) => {
        return acc.add(query.data.amount.amountUnformatted)
      }, ethers.constants.Zero)
    const { amount } = roundPrizeAmount(totalAmountUnformatted, tokenData.token.decimals)
    return amount
  }, [drawWinnerQueries, isTokenDataFetched])

  return (
    <CurrencyValue
      baseValue={totalAmount}
      options={{ minimumFractionDigits: 0, maximumFractionDigits: 0 }}
    />
  )
}
