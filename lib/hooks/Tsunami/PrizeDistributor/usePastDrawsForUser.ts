import { Amount, Token } from '@pooltogether/hooks'
import { Draw, PrizeDistributor, PrizeDistribution } from '@pooltogether/v4-js-client'
import { NO_REFETCH } from 'lib/constants/queryKeys'
import { useUsersAddress } from 'lib/hooks/useUsersAddress'
import { getAmountFromBigNumber } from 'lib/utils/getAmountFromBigNumber'
import { sortDrawsByDrawId } from 'lib/utils/sortByDrawId'
import { useQuery } from 'react-query'
import { useNextDrawDate } from '../useNextDrawDate'

/**
 * Returns the draws & prize distributions that are claimable along with the amount the
 * user has claimed.
 * @param prizeDistributor
 * @param token
 * @returns
 */
export const usePastDrawsForUser = (prizeDistributor: PrizeDistributor, token: Token) => {
  const nextDrawDate = useNextDrawDate()
  const usersAddress = useUsersAddress()
  const enabled = Boolean(prizeDistributor) && Boolean(usersAddress) && Boolean(token)

  return useQuery(
    ['usePastDrawsForUser', prizeDistributor?.id(), nextDrawDate.toISOString()],
    () => getPastDrawsForUser(usersAddress, prizeDistributor, token),
    {
      ...NO_REFETCH,
      enabled
    }
  )
}

const getPastDrawsForUser = async (
  usersAddress: string,
  prizeDistributor: PrizeDistributor,
  token: Token
) => {
  const claimableDrawIds = await prizeDistributor.getClaimableDrawIds()
  const [drawsAndPrizeDistributions, claimedAmounts] = await Promise.all([
    prizeDistributor.getDrawsAndPrizeDistributions(claimableDrawIds),
    prizeDistributor.getUsersClaimedAmounts(usersAddress, claimableDrawIds)
  ])

  const draws: {
    draw: Draw
    prizeDistribution: PrizeDistribution
    claimedAmount: Amount
  }[] = []

  drawsAndPrizeDistributions.map((drawAndPrizeDistribution, index) => {
    draws.push({
      draw: drawAndPrizeDistribution.draw,
      prizeDistribution: drawAndPrizeDistribution.prizeDistribution,
      claimedAmount: getAmountFromBigNumber(claimedAmounts[index], token.decimals)
    })
  })

  return draws.sort(sortByDrawId)
}

const sortByDrawId = (
  a: {
    draw: Draw
    prizeDistribution: PrizeDistribution
  },
  b: {
    draw: Draw
    prizeDistribution: PrizeDistribution
  }
) => sortDrawsByDrawId(a.draw, b.draw)
