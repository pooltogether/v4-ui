import { DrawPrize, Draw } from '@pooltogether/v4-js-client'
import { NO_REFETCH } from 'lib/constants/queryKeys'
import { useUsersAddress } from 'lib/hooks/useUsersAddress'
import { useQuery } from 'react-query'

export const useUnclaimedDraws = (drawPrize: DrawPrize) => {
  const usersAddress = useUsersAddress()
  const enabled = Boolean(drawPrize) && Boolean(usersAddress)
  return useQuery(
    ['useDraws', drawPrize?.id()],
    async () => getUnclaimedDraws(usersAddress, drawPrize),
    {
      ...NO_REFETCH,
      enabled
    }
  )
}

const getUnclaimedDraws = async (usersAddress: string, drawPrize: DrawPrize): Promise<Draw[]> => {
  const drawIds = await drawPrize.getValidDrawIds()
  const [draws, claimedAmounts] = await Promise.all([
    drawPrize.getDraws(drawIds),
    drawPrize.getUsersClaimedAmounts(usersAddress, drawIds)
  ])

  console.log('draws', draws, claimedAmounts)
  const filteredDraws = draws.filter((_, index) => claimedAmounts[index].isZero())
  console.log(filteredDraws)

  return filteredDraws
}
