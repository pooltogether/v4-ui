import { useUsersAddress } from '@pooltogether/hooks'
import { DrawPrize, Draw } from '.yalc/@pooltogether/v4-js-client/dist'
import { NO_REFETCH } from 'lib/constants/queryKeys'
import { useValidDraws } from 'lib/hooks/Tsunami/DrawPrizes/useValidDraws'
import { useQuery } from 'react-query'

export const useUsersClaimablePrizes = (drawPrize: DrawPrize) => {
  const { data: draws, isFetched: isDrawsFetched } = useValidDraws(drawPrize)
  const usersAddress = useUsersAddress()
  const enabled = Boolean(drawPrize) && Boolean(usersAddress) && Boolean(isDrawsFetched)
  return useQuery(
    ['useUsersClaimablePrizes', drawPrize?.id(), usersAddress, draws],
    async () => getUsersClaimablePrizes(drawPrize, draws, usersAddress),
    { ...NO_REFETCH, enabled }
  )
}

const getUsersClaimablePrizes = async (
  drawPrize: DrawPrize,
  draws: Draw[],
  usersAddress: string
) => {
  const claimablePrizesPromises = draws.map((draw) => drawPrize.getUsersPrizes(usersAddress, draw))
  const result = await Promise.all(claimablePrizesPromises)
  console.log('getUsersClaimablePrizes', result)
  return result
}
