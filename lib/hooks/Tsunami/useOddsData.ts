import { Amount } from '@pooltogether/hooks'
import { calculateNumberOfPrizesForIndex, LinkedPrizePool } from '@pooltogether/v4-js-client'
import { BigNumber, ethers } from 'ethers'
import { TSUNAMI_USDC_PRIZE_DISTRIBUTION } from 'lib/constants/prizeDistribution'
import { getAmountFromBigNumber } from 'lib/utils/getAmountFromBigNumber'
import { useQuery } from 'react-query'
import { useLinkedPrizePool } from './LinkedPrizePool/useLinkedPrizePool'
import { useTicketDecimals } from './PrizePool/useTicketDecimals'

export const useOddsData = () => {
  const { data: linkedPrizePool, isFetched: isLinkedPrizePoolFetched } = useLinkedPrizePool()
  const { data: ticketDecimals, isFetched: isTicketDecimalsFetched } = useTicketDecimals()
  const enabled = isLinkedPrizePoolFetched && isTicketDecimalsFetched
  return useQuery(['useOddsData'], () => getOddsData(linkedPrizePool, ticketDecimals), { enabled })
}

const getOddsData = async (linkedPrizePool: LinkedPrizePool, decimals: string) => {
  const totalSupplyResults = await Promise.all(
    linkedPrizePool.prizePools.map((prizePool) => prizePool.getTicketTotalSupply())
  )
  const totalSupplyUnformatted = totalSupplyResults.reduce(
    (totalTotalSupply: BigNumber, totalSupply: BigNumber) => {
      return totalTotalSupply.add(totalSupply)
    },
    ethers.constants.Zero
  )
  const prizeDistribution = TSUNAMI_USDC_PRIZE_DISTRIBUTION
  const numberOfPrizes = prizeDistribution.tiers.reduce(
    (totalNumberPrizes: number, currentTier: number, index: number) => {
      if (currentTier === 0) return totalNumberPrizes
      return (
        totalNumberPrizes + calculateNumberOfPrizesForIndex(prizeDistribution.bitRangeSize, index)
      )
    },
    0
  )
  return {
    numberOfPrizes,
    decimals,
    totalSupply: getAmountFromBigNumber(totalSupplyUnformatted, decimals)
  }
}
