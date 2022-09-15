import { Amount } from '@pooltogether/hooks'
import { divideBigNumbers } from '@pooltogether/utilities'
import { PrizePool } from '@pooltogether/v4-client-js'
import { parseEther } from 'ethers/lib/utils'
import { useQuery } from 'react-query'
import { usePrizePoolNetworkTicketTwabTotalSupply } from '../PrizePoolNetwork/usePrizePoolNetworkTicketTwabTotalSupply'
import { usePrizePoolTicketTwabTotalSupply } from './usePrizePoolTicketTwabTotalSupply'

export const usePrizePoolPercentageOfPicks = (prizePool: PrizePool) => {
  const { data: prizePoolTvlData, isFetched: isPrizePoolTvlFetched } =
    usePrizePoolTicketTwabTotalSupply(prizePool)
  const { data: prizePoolNetworkTvl, isFetched: isPrizePoolNetworkTvlFetched } =
    usePrizePoolNetworkTicketTwabTotalSupply()

  const isFetched = isPrizePoolTvlFetched && isPrizePoolNetworkTvlFetched

  return useQuery(
    getPrizePoolPercentageOfPicksKey(
      prizePool,
      prizePoolTvlData?.amount,
      prizePoolNetworkTvl?.totalSupply
    ),
    () => {
      return getPrizePoolPercentageOfPicks(
        prizePool,
        prizePoolTvlData?.amount.amount,
        prizePoolNetworkTvl?.totalSupply.amount
      )
    },
    { enabled: isFetched }
  )
}

export const getPrizePoolPercentageOfPicksKey = (
  prizePool: PrizePool,
  prizePoolTvl: Amount,
  prizePoolNetworkTvl: Amount
) => [
  'usePrizePoolPercentageOfPicks',
  prizePool?.id(),
  prizePoolTvl?.amount,
  prizePoolNetworkTvl?.amount
]

export const getPrizePoolPercentageOfPicks = (
  prizePool: PrizePool,
  prizePoolTvl: string,
  prizePoolNetworkTvl: string
) => {
  const prizePoolTvlNormalized = parseEther(prizePoolTvl)
  const prizePoolNetworkTvlNormalized = parseEther(prizePoolNetworkTvl)
  return {
    prizePoolId: prizePool.id(),
    percentage: prizePoolTvlNormalized.isZero()
      ? 0
      : divideBigNumbers(prizePoolTvlNormalized, prizePoolNetworkTvlNormalized, 8)
  }
}
