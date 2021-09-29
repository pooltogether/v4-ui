import { useUsersAddress } from '@pooltogether/hooks'
import { DrawPrize, Draw } from '.yalc/@pooltogether/v4-js-client/dist'
import { NO_REFETCH } from 'lib/constants/queryKeys'
import { useQuery } from 'react-query'

// TODO: Optimize this rather than calling for each draw on render
export const useUsersClaimablePrize = (drawPrize: DrawPrize, draw: Draw, disabled?: boolean) => {
  const usersAddress = useUsersAddress()
  const enabled = Boolean(drawPrize) && Boolean(usersAddress) && Boolean(draw) && !disabled
  return useQuery(
    ['useUsersClaimablePrizes', drawPrize?.id(), usersAddress, draw?.drawId],
    async () => getUsersClaimablePrize(drawPrize, draw, usersAddress),
    { ...NO_REFETCH, enabled }
  )
}

const getUsersClaimablePrize = async (drawPrize: DrawPrize, draw: Draw, usersAddress: string) => {
  const result = await drawPrize.getUsersPrizes(usersAddress, draw)
  console.log('getUsersClaimablePrize', draw.drawId, result)
  return result
}