import { Amount } from '@pooltogether/hooks'
import {
  dedupeArray,
  formatCurrencyNumberForDisplay,
  getAmountFromUnformatted
} from '@pooltogether/utilities'
import { PrizePool, PrizeTier } from '@pooltogether/v4-client-js'
import { getPrizeTierNumberOfPrizes } from '@utils/getPrizeTierNumberOfPrizes'
import { getPrizeTierValues } from '@utils/getPrizeTierValues'
import { useQuery } from 'react-query'
import { usePrizePoolTicketDecimals } from './usePrizePoolTicketDecimals'
import { useUpcomingPrizeTier } from './useUpcomingPrizeTier'

/**
 * Total number of prizes is the percentage of picks given to the supplied prize pool multiplied by the total number of prizes
 * @param prizePool
 * @returns
 */
export const usePrizePoolPrizes = (prizePool: PrizePool) => {
  const { data: prizeTierData, isFetched: isPrizeTierFetched } = useUpcomingPrizeTier(prizePool)
  const { data: decimals } = usePrizePoolTicketDecimals(prizePool)

  return useQuery(
    getPrizePoolPrizesKey(prizePool, prizeTierData?.prizeTier, decimals),
    () => getPrizePoolPrizes(prizePool, prizeTierData?.prizeTier, decimals),
    { enabled: isPrizeTierFetched && !!decimals }
  )
}

export interface PrizeData {
  chainId: number
  prizePoolId: string
  prizeTier: PrizeTier
  numberOfPrizesByTier: number[]
  totalNumberOfPrizes: number
  valueOfPrizesByTier: Amount[]
  valueOfPrizesFormattedList: string[]
  smallPrizeValueList: string[]
  totalValueOfPrizes: Amount
  averagePrizeValue: Amount
  grandPrizeValue: Amount
  decimals: string
}

export const getPrizePoolPrizesKey = (
  prizePool: PrizePool,
  prizeTier: PrizeTier,
  decimals: string
) => [
  'usePrizePoolPrizes',
  prizePool?.id(),
  prizeTier?.bitRangeSize,
  prizeTier?.tiers.join('-'),
  decimals
]

export const getPrizePoolPrizes = (
  prizePool: PrizePool,
  prizeTier: PrizeTier,
  decimals: string
): PrizeData => {
  const numberOfPrizesByTier = getPrizeTierNumberOfPrizes(prizeTier)
  const totalNumberOfPrizes = numberOfPrizesByTier.reduce(
    (total, numberOfPrizes) => total + numberOfPrizes,
    0
  )
  const valueOfPrizesByTier = getPrizeTierValues(prizeTier, decimals)
  const totalValueOfPrizes = getAmountFromUnformatted(prizeTier.prize, decimals)
  const averagePrizeValue = getAmountFromUnformatted(
    totalValueOfPrizes.amountUnformatted.div(totalNumberOfPrizes),
    decimals
  )

  const valueOfPrizesFormattedList: string[] = dedupeArray(
    valueOfPrizesByTier
      .filter((p) => !p.amountUnformatted.isZero())
      .map((p) =>
        formatCurrencyNumberForDisplay(p.amount, 'usd', {
          maximumFractionDigits: 0
        })
      )
  )

  const grandPrizeValue = [...valueOfPrizesByTier].sort((a, b) =>
    b.amountUnformatted.lte(a.amountUnformatted) ? -1 : 1
  )[0]

  const smallPrizeValueList = dedupeArray(
    valueOfPrizesByTier
      .filter(
        (p) =>
          !p.amountUnformatted.isZero() &&
          !p.amountUnformatted.eq(grandPrizeValue.amountUnformatted)
      )
      .map((p) =>
        formatCurrencyNumberForDisplay(p.amount, 'usd', {
          maximumFractionDigits: 0
        })
      )
  )

  return {
    chainId: prizePool.chainId,
    prizePoolId: prizePool.id(),
    prizeTier,
    numberOfPrizesByTier,
    totalNumberOfPrizes,
    valueOfPrizesByTier,
    valueOfPrizesFormattedList,
    smallPrizeValueList,
    totalValueOfPrizes,
    averagePrizeValue,
    grandPrizeValue,
    decimals
  }
}
