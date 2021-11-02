import { calculateNumberOfPrizesForIndex, LinkedPrizePool } from '@pooltogether/v4-js-client'
import { calculateOdds } from '@pooltogether/utilities'
import { TSUNAMI_USDC_PRIZE_DISTRIBUTION } from 'lib/constants/prizeDistribution'
import { useQuery } from 'react-query'
import { useUsersAddress } from '../useUsersAddress'
import { useLinkedPrizePool } from './LinkedPrizePool/useLinkedPrizePool'
import { BigNumber, ethers } from 'ethers'

export const useUsersUpcomingOddsOfWinningAPrize = () => {
  const { data: linkedPrizePool, isFetched: isLinkedPrizePoolFetched } = useLinkedPrizePool()
  const usersAddress = useUsersAddress()
  const enabled = isLinkedPrizePoolFetched && Boolean(usersAddress)

  return useQuery(
    ['useUsersOddsOfWinningAPrize', usersAddress],
    () => getUsersOdds(linkedPrizePool, usersAddress),
    { enabled }
  )
}

const getUsersOdds = async (linkedPrizePool: LinkedPrizePool, usersAddress: string) => {
  const totalSupplyResults = await Promise.all(
    linkedPrizePool.prizePools.map((prizePool) => prizePool.getTicketTotalSupply())
  )
  const balanceResults = await Promise.all(
    linkedPrizePool.prizePools.map((prizePool) => prizePool.getUsersTicketBalance(usersAddress))
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
  const totalBalance = balanceResults.reduce((totalBalance: BigNumber, balance: BigNumber) => {
    return totalBalance.add(balance)
  }, ethers.constants.Zero)

  return calculateOdds(totalBalance, totalTotalSupply, '6', numberOfPrizes)
}
