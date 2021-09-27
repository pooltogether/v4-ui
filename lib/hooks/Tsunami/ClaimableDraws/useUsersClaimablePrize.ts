import { useUsersAddress } from '.yalc/@pooltogether/hooks/dist'
import { ClaimableDraw, Draw } from '.yalc/@pooltogether/v4-js-client/dist'
import { NO_REFETCH } from 'lib/constants/queryKeys'
import { useQuery } from 'react-query'

// TODO: Optimize this rather than calling for each draw on render
export const useUsersClaimablePrize = (
  claimableDraw: ClaimableDraw,
  draw: Draw,
  disabled?: boolean
) => {
  const usersAddress = useUsersAddress()
  const enabled = Boolean(claimableDraw) && Boolean(usersAddress) && Boolean(draw) && !disabled
  return useQuery(
    ['useUsersClaimablePrizes', claimableDraw?.id(), usersAddress, draw?.drawId],
    async () => getUsersClaimablePrize(claimableDraw, draw, usersAddress),
    { ...NO_REFETCH, enabled }
  )
}

const getUsersClaimablePrize = async (
  claimableDraw: ClaimableDraw,
  draw: Draw,
  usersAddress: string
) => {
  const result = await claimableDraw.getUsersPrizes(usersAddress, draw)
  console.log('getUsersClaimablePrize', draw.drawId, result)
  return result
}
