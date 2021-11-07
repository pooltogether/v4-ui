import { Amount, useRefetchInterval } from '@pooltogether/hooks'
import {
  calculateNumberOfPrizesForIndex,
  LinkedPrizePool,
  PrizeDistribution,
  PrizePool
} from '@pooltogether/v4-js-client'
import { BigNumber, ethers } from 'ethers'
import { TSUNAMI_USDC_PRIZE_DISTRIBUTION } from 'lib/constants/prizeDistribution'
import { getAmountFromBigNumber } from 'lib/utils/getAmountFromBigNumber'
import { useQuery } from 'react-query'
import { useLinkedPrizePool } from './LinkedPrizePool/useLinkedPrizePool'
import { useTicketDecimals } from './PrizePool/useTicketDecimals'

// TODO: Split this for each network
export const useTotalOddsData = () => {
  const { data: linkedPrizePool, isFetched: isLinkedPrizePoolFetched } = useLinkedPrizePool()
  const { data: decimals, isFetched: isTicketDecimalsFetched } = useTicketDecimals()
  return useQuery(
    ['useTotalOddsData', linkedPrizePool.id(), decimals],
    async () => {
      const oddsDatas = await Promise.all(
        linkedPrizePool.prizePools.map((prizePool) => getOddsData(prizePool, decimals))
      )
      const totalSupplyUnformatted = oddsDatas.reduce(
        (
          totalTotalSupply: BigNumber,
          oddsData: {
            numberOfPrizes: number
            decimals: string
            totalSupply: Amount
          }
        ) => {
          return totalTotalSupply.add(oddsData.totalSupply.amountUnformatted)
        },
        ethers.constants.Zero
      )
      const prizeDistribution = TSUNAMI_USDC_PRIZE_DISTRIBUTION
      const numberOfPrizes = getNumberOfPrizes(prizeDistribution)
      return {
        numberOfPrizes,
        decimals,
        totalSupply: getAmountFromBigNumber(totalSupplyUnformatted, decimals)
      }
    },
    {
      enabled: isLinkedPrizePoolFetched && isTicketDecimalsFetched
    }
  )
}

export const useOddsData = (prizePool: PrizePool) => {
  const refetchInterval = useRefetchInterval(prizePool?.chainId)
  const { data: ticketDecimals, isFetched: isTicketDecimalsFetched } = useTicketDecimals()
  const enabled = Boolean(prizePool) && isTicketDecimalsFetched
  return useQuery(['useOddsData', prizePool?.id()], () => getOddsData(prizePool, ticketDecimals), {
    enabled,
    refetchInterval
  })
}

const getOddsData = async (prizePool: PrizePool, decimals: string) => {
  const totalSupplyUnformatted = await prizePool.getTicketTotalSupply()
  const prizeDistribution = TSUNAMI_USDC_PRIZE_DISTRIBUTION
  const numberOfPrizes = getNumberOfPrizes(prizeDistribution)
  return {
    numberOfPrizes,
    decimals,
    totalSupply: getAmountFromBigNumber(totalSupplyUnformatted, decimals)
  }
}

const getNumberOfPrizes = (prizeDistribution: PrizeDistribution) => {
  return prizeDistribution.tiers.reduce(
    (totalNumberPrizes: number, currentTier: number, index: number) => {
      if (currentTier === 0) return totalNumberPrizes
      return (
        totalNumberPrizes + calculateNumberOfPrizesForIndex(prizeDistribution.bitRangeSize, index)
      )
    },
    0
  )
}
