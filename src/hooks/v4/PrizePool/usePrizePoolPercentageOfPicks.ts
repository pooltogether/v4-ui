import { PrizePool } from '@pooltogether/v4-client-js'
import { parseEther } from 'ethers/lib/utils'
import { usePrizePoolNetworkTicketTwabTotalSupply } from '../PrizePoolNetwork/usePrizePoolNetworkTicketTwabTotalSupply'
import { usePrizePoolTicketTwabTotalSupply } from './usePrizePoolTicketTwabTotalSupply'

export const usePrizePoolPercentageOfPicks = (prizePool: PrizePool) => {
  const { data: prizePoolTvl, isFetched: isPrizePoolTvlFetched } =
    usePrizePoolTicketTwabTotalSupply(prizePool)
  const { data: prizePoolNetworkTvl, isFetched: isPrizePoolNetworkTvlFetched } =
    usePrizePoolNetworkTicketTwabTotalSupply()

  if (!isPrizePoolTvlFetched || !isPrizePoolNetworkTvlFetched) {
    return {
      data: null,
      isFetched: false
    }
  }

  return {
    data: getPrizePoolPercentageOfPicks(
      prizePoolTvl.amount.amount,
      prizePoolNetworkTvl.totalSupply.amount
    ),
    isFetched: true
  }
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
  return prizePoolTvlNormalized.mul(10000).div(prizePoolNetworkTvlNormalized).toNumber() / 10000
}
