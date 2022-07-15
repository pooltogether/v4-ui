import { useMemo } from 'react'
import { sToD, msToS } from '@pooltogether/utilities'
import { Amount } from '@pooltogether/hooks'
import { useCoingeckoTokenPrices, TokenPrice } from '@pooltogether/hooks'

import { Promotion, Epoch } from '@interfaces/promotions'

export const useNextRewardIn = (promotion: Promotion) => {
  const now = msToS(Date.now())

  const remainingEpochsArray = promotion.epochCollection.remainingEpochsArray
  const nextEpochEndTime = remainingEpochsArray?.[0]?.epochEndTimestamp

  const value = sToD(nextEpochEndTime - now)

  return { value, unit: 'days' }
}

interface EstimateRow {
  epoch: Epoch
  estimateAmount: number
}

interface EstimateRowCollection {
  estimateRows: Array<EstimateRow>
  estimateRowsReversed: Array<EstimateRow>
}

// Tacks on the user's estimated amount per remaining epoch to the list of remaining epochs
// and returns that array
export const useEstimateRows = (
  promotion: Promotion,
  estimateAmount: Amount
): EstimateRowCollection => {
  const remainingEpochsArray = promotion.epochCollection.remainingEpochsArray
  if (!remainingEpochsArray || remainingEpochsArray?.length <= 0) {
    return { estimateRows: [], estimateRowsReversed: [] }
  }

  const estimate = estimateAmount?.amount ? Number(estimateAmount?.amount) : 0
  const estimatePerEpoch = estimate / promotion.remainingEpochs

  return useMemo(() => {
    const estimateRows: Array<EstimateRow> = remainingEpochsArray.map((epoch) => ({
      epoch,
      estimateAmount: estimatePerEpoch
    }))

    const estimateRowsReversed = [...estimateRows.reverse()]

    return { estimateRows, estimateRowsReversed }
  }, [estimatePerEpoch, remainingEpochsArray])
}

export const useRemainingEpochsArrays = (promotion: Promotion) => {
  const remainingEpochsArray = promotion.epochCollection.remainingEpochsArray
  if (!remainingEpochsArray || remainingEpochsArray?.length <= 0) {
    return []
  }

  return remainingEpochsArray
}

export const useLastEpochEndTime = (remainingEpochsArray: Array<Epoch>) => {
  return remainingEpochsArray?.[remainingEpochsArray.length - 1]?.epochEndTimestamp
}

export const usePromotionDaysRemaining = (promotion: Promotion) => {
  const remainingEpochsArray = useRemainingEpochsArrays(promotion)
  const lastEpochEndTime = useLastEpochEndTime(remainingEpochsArray)

  const now = msToS(Date.now())
  return sToD(lastEpochEndTime) - sToD(now)
}

// Calculate the variable annual percentage rate for a promotion
export const usePromotionVAPR = (promotion: Promotion): number => {
  console.log(promotion)
  console.log(promotion)
  console.log(promotion)

  const { data: tokenPrices, isFetched: tokenPricesIsFetched } = useCoingeckoTokenPrices(
    promotion.chainId,
    [promotion.token]
  )
  console.log(tokenPrices)

  return useMemo(() => {
    const daysRemaining = usePromotionDaysRemaining(promotion)
    let vapr: number = 0
    if (daysRemaining > 0) {
      // const dailyAmountUnformatted = calculatePercentageOfBigNumber(
      //   prizeTierData.prizeTier.prize,
      //   percentage.percentage
      // )
      // vapr = calculateApr(totalAmountUnformatted, dailyAmountUnformatted)
      // console.log(vapr)
      // vapr = (0.0144 / 1) * 365 * 100
      // vapr = (totalDripDailyValue / totalMeasureTokenValueUsd) * 365 * 100
    }

    return vapr
  }, [promotion, tokenPrices])
}

// const { address, amountUnformatted } = tokenFaucet.dripToken

//       let usd = tokenFaucet.dripToken.usd

//       // asset is pPOOL, use POOL price
//       if (address.toLowerCase() === CUSTOM_CONTRACT_ADDRESSES[NETWORK.mainnet].PPOOL) {
//         usd = pool.tokens.pool.usd
//       }

//       if (usd && amountUnformatted !== ethers.constants.Zero) {
//         const { dripRatePerSecond, measure } = tokenFaucet

//         const totalDripPerDay = Number(dripRatePerSecond) * SECONDS_PER_DAY
//         const totalDripDailyValue = totalDripPerDay * usd

//         const totalTicketValueUsd = Number(pool.prizePool.totalTicketValueLockedUsd)
//         const totalSponsorshipValueUsd = Number(pool.prizePool.totalSponsorshipValueLockedUsd)

//         const faucetIncentivizesSponsorship =
//           measure.toLowerCase() === pool.tokens.sponsorship.address.toLowerCase()

//         const totalValueUsd = faucetIncentivizesSponsorship
//           ? totalSponsorshipValueUsd
//           : totalTicketValueUsd

//         if (tokenFaucet.remainingDays <= 0) {
//           tokenFaucet.apr = 0
//         } else {
//           tokenFaucet.apr = (totalDripDailyValue / totalValueUsd) * 365 * 100
//         }
//       }
//     })
