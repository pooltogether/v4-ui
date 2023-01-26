import { Amount } from '@pooltogether/hooks'
import { divideBigNumbers } from '@pooltogether/utilities'
import { PrizePool } from '@pooltogether/v4-client-js'
import { PrizeTier, PrizeTierV2 } from '@pooltogether/v4-utils-js'
import { formatUnits, parseEther, parseUnits } from 'ethers/lib/utils'
import { useQuery } from 'react-query'
import { usePrizePoolTicketTwabTotalSupply } from './usePrizePoolTicketTwabTotalSupply'
import { useUpcomingPrizeTier } from './useUpcomingPrizeTier'
import { usePrizePoolNetworkTicketTwabTotalSupply } from '../PrizePoolNetwork/usePrizePoolNetworkTicketTwabTotalSupply'

export const usePrizePoolPercentageOfPicks = (prizePool: PrizePool) => {
  const { data: prizePoolTvlData, isFetched: isPrizePoolTvlFetched } =
    usePrizePoolTicketTwabTotalSupply(prizePool)
  const { data: prizePoolNetworkTvl, isFetched: isPrizePoolNetworkTvlFetched } =
    usePrizePoolNetworkTicketTwabTotalSupply()
  const {
    data: prizeTierData,
    isFetched: isPrizeTierFetched,
    isError: isPrizeTierError
  } = useUpcomingPrizeTier(prizePool)

  const isFetched = isPrizePoolTvlFetched && isPrizePoolNetworkTvlFetched && isPrizeTierFetched

  return useQuery(
    calculatePrizePoolPercentageOfPicksKey(
      prizePool,
      prizePoolTvlData?.amount,
      prizePoolNetworkTvl?.totalSupply,
      prizeTierData?.prizeTier
    ),
    () => {
      return calculatePrizePoolPercentageOfPicks(
        prizePool,
        prizePoolTvlData.amount,
        prizePoolNetworkTvl?.totalSupply,
        prizeTierData?.prizeTier
      )
    },
    { enabled: isFetched && !isPrizeTierError && !!prizeTierData?.prizeTier }
  )
}

export const calculatePrizePoolPercentageOfPicksKey = (
  prizePool: PrizePool,
  prizePoolTvl: Amount,
  prizePoolNetworkTvl: Amount,
  prizeTier: PrizeTier | PrizeTierV2
) => [
  'usePrizePoolPercentageOfPicks',
  prizePool?.id(),
  prizePoolTvl?.amount,
  prizePoolNetworkTvl?.amount,
  prizeTier?.drawId
]

export const calculatePrizePoolPercentageOfPicks = (
  prizePool: PrizePool,
  prizePoolTvl: Amount,
  prizePoolNetworkTvl: Amount,
  prizeTier: PrizeTier | PrizeTierV2
) => {
  let percentage: number
  if (prizePoolTvl.amountUnformatted.isZero()) {
    percentage = 0
  } else if ('dpr' in prizeTier && prizeTier.dpr !== undefined) {
    // TODO: Use DPR decimals constant
    percentage = Number(
      formatUnits(prizePoolTvl.amountUnformatted.mul(prizeTier.dpr).div(prizeTier.prize), 9)
    )
  } else {
    const prizePoolTvlNormalized = parseEther(prizePoolTvl.amount)
    const prizePoolNetworkTvlNormalized = parseEther(prizePoolNetworkTvl.amount)
    percentage = divideBigNumbers(prizePoolTvlNormalized, prizePoolNetworkTvlNormalized, 8)
  }

  return {
    chainId: prizePool.chainId,
    prizePoolId: prizePool.id(),
    percentage
  }
}
