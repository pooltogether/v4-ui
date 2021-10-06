import { Amount, Token } from '@pooltogether/hooks'
import { Draw, DrawPrize, PrizeDistribution } from '@pooltogether/v4-js-client'
import { NO_REFETCH } from 'lib/constants/queryKeys'
import { useUsersAddress } from 'lib/hooks/useUsersAddress'
import { getAmountFromBigNumber } from 'lib/utils/getAmountFromBigNumber'
import { sortDrawsByDrawId } from 'lib/utils/sortByDrawId'
import { useQuery } from 'react-query'
import { useNextDrawDate } from '../useNextDrawDate'

export const usePastDrawsForUser = (drawPrize: DrawPrize, token: Token) => {
  const nextDrawDate = useNextDrawDate()
  const usersAddress = useUsersAddress()
  const enabled = Boolean(drawPrize) && Boolean(usersAddress) && Boolean(token)

  return useQuery(
    ['usePastDrawsForUser', drawPrize?.id(), nextDrawDate.toISOString()],
    () => getPastDrawsForUser(usersAddress, drawPrize, token),
    {
      ...NO_REFETCH,
      enabled
    }
  )
}

const getPastDrawsForUser = async (usersAddress: string, drawPrize: DrawPrize, token: Token) => {
  const claimableDrawIds = await drawPrize.getClaimableDrawIds()
  const [drawsAndPrizeDistributions, claimedAmounts] = await Promise.all([
    drawPrize.getDrawsAndPrizeDistributions(claimableDrawIds),
    drawPrize.getUsersClaimedAmounts(usersAddress, claimableDrawIds)
  ])

  console.log(
    'getPastDrawsForUser',
    drawPrize,
    claimableDrawIds,
    drawsAndPrizeDistributions,
    claimedAmounts
  )

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

  console.log(draws)

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
