import { Amount, Token } from '@pooltogether/hooks'
import { Draw, PrizeDistributor, PrizeDistribution } from '@pooltogether/v4-js-client'
import { NO_REFETCH } from 'lib/constants/queryKeys'
import { useUsersAddress } from 'lib/hooks/useUsersAddress'
import { getAmountFromBigNumber } from 'lib/utils/getAmountFromBigNumber'
import { sortDrawsByDrawId } from 'lib/utils/sortByDrawId'
import { useQuery } from 'react-query'
import { useDrawBeaconPeriod } from '../LinkedPrizePool/useDrawBeaconPeriod'

/**
 * Returns the draws & prize distributions that are valid along with the amount the
 * user has claimed.
 * @param prizeDistributor
 * @param token
 * @returns
 */
export const usePastDrawsForUser = (prizeDistributor: PrizeDistributor, token: Token) => {
  const usersAddress = useUsersAddress()
  const { data: drawBeaconPeriod, isFetched: isDrawBeaconFetched } = useDrawBeaconPeriod()
  const enabled =
    Boolean(prizeDistributor) && Boolean(usersAddress) && Boolean(token) && isDrawBeaconFetched

  return useQuery(
    ['usePastDrawsForUser', prizeDistributor?.id(), drawBeaconPeriod?.startedAtSeconds.toString()],
    () => getPastDrawsForUser(usersAddress, prizeDistributor, token),
    {
      enabled
    }
  )
}

const getPastDrawsForUser = async (
  usersAddress: string,
  prizeDistributor: PrizeDistributor,
  token: Token
) => {
  const validDrawIds = await prizeDistributor.getValidDrawIds()
  const [drawsAndPrizeDistributions, claimedAmounts] = await Promise.all([
    prizeDistributor.getDrawsAndPrizeDistributions(validDrawIds),
    prizeDistributor.getUsersClaimedAmounts(usersAddress, validDrawIds)
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
