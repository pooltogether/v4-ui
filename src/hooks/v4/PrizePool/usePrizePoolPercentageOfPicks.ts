import { PrizePool } from '@pooltogether/v4-client-js'
import { divideBigNumbers } from '@utils/divideBigNumbers'
import { parseEther } from 'ethers/lib/utils'
import { useQuery } from 'react-query'
import { usePrizePoolNetworkTicketTwabTotalSupply } from '../PrizePoolNetwork/usePrizePoolNetworkTicketTwabTotalSupply'
import { usePrizePoolTicketTwabTotalSupply } from './usePrizePoolTicketTwabTotalSupply'

export const usePrizePoolPercentageOfPicks = (prizePool: PrizePool) => {
  const { data: prizePoolTvl, isFetched: isPrizePoolTvlFetched } =
    usePrizePoolTicketTwabTotalSupply(prizePool)
  const { data: prizePoolNetworkTvl, isFetched: isPrizePoolNetworkTvlFetched } =
    usePrizePoolNetworkTicketTwabTotalSupply()

  const isFetched = isPrizePoolTvlFetched && isPrizePoolNetworkTvlFetched

  return useQuery(
    [
      'usePrizePoolPercentageOfPicks',
      prizePool?.id(),
      prizePoolTvl?.amount.amount,
      prizePoolNetworkTvl?.totalSupply.amount
    ],
    () => {
      return getPrizePoolPercentageOfPicks(
        prizePoolTvl.amount.amount,
        prizePoolNetworkTvl.totalSupply.amount
      )
    },
    { enabled: isFetched }
  )
}

export const getPrizePoolPercentageOfPicks = (
  prizePoolTvl: string,
  prizePoolNetworkTvl: string
) => {
  const prizePoolTvlNormalized = parseEther(prizePoolTvl)
  const prizePoolNetworkTvlNormalized = parseEther(prizePoolNetworkTvl)
  if (prizePoolTvlNormalized.isZero()) {
    return 0
  }
  return divideBigNumbers(prizePoolTvlNormalized, prizePoolNetworkTvlNormalized)
}
