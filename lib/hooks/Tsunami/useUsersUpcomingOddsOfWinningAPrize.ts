import { calculateNumberOfPrizesForIndex, LinkedPrizePool } from '@pooltogether/v4-js-client'
import { calculateOdds } from '@pooltogether/utilities'
import { TSUNAMI_USDC_PRIZE_DISTRIBUTION } from 'lib/constants/prizeDistribution'
import { useQuery } from 'react-query'
import { useUsersAddress } from '../useUsersAddress'
import { useLinkedPrizePool } from './LinkedPrizePool/useLinkedPrizePool'
import { BigNumber, ethers } from 'ethers'
import { useUsersCurrentPrizePoolTwabs } from 'lib/hooks/Tsunami/PrizePool/useUsersCurrentPrizePoolTwabs'
import { Amount } from '@pooltogether/hooks'
import { useTicketDecimals } from 'lib/hooks/Tsunami/PrizePool/useTicketDecimals'

export const useUsersUpcomingOddsOfWinningAPrize = () => {
  const { data: linkedPrizePool, isFetched: isLinkedPrizePoolFetched } = useLinkedPrizePool()
  const { data: twabs, isFetched: isTwabsFetched } = useUsersCurrentPrizePoolTwabs()
  const { data: ticketDecimals, isFetched: isTicketDecimalsFetched } = useTicketDecimals()
  const usersAddress = useUsersAddress()
  const enabled =
    isLinkedPrizePoolFetched && Boolean(usersAddress) && isTwabsFetched && isTicketDecimalsFetched

  return useQuery(
    ['useUsersOddsOfWinningAPrize', usersAddress],
    () => getUsersOdds(linkedPrizePool, twabs, ticketDecimals),
    { enabled }
  )
}

const getUsersOdds = async (
  linkedPrizePool: LinkedPrizePool,
  twabs: {
    total: Amount
    ethereum: Amount
    polygon: Amount
  },
  decimals: string
) => {
  const totalSupplyResults = await Promise.all(
    linkedPrizePool.prizePools.map((prizePool) => prizePool.getTicketTotalSupply())
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
  const totalTotalSupply = totalSupplyResults.reduce(
    (totalTotalSupply: BigNumber, totalSupply: BigNumber) => {
      return totalTotalSupply.add(totalSupply)
    },
    ethers.constants.Zero
  )
  const totalBalance = twabs.total.amountUnformatted

  const odds = calculateOdds(totalBalance, totalTotalSupply, decimals, numberOfPrizes)
  const oneOverOdds = 1 / odds

  return {
    odds,
    oneOverOdds,
    decimals,
    totalBalanceUnformatted: totalBalance,
    totalSupplyUnformatted: totalTotalSupply,
    numberOfPrizes
  }
}
