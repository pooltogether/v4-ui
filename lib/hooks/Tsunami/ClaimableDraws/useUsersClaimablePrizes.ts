import { useUsersAddress } from '.yalc/@pooltogether/hooks/dist'
import { ClaimableDraw } from '.yalc/@pooltogether/v4-js-client/dist'
import { NO_REFETCH } from 'lib/constants/queryKeys'
import { useDraws } from 'lib/hooks/Tsunami/ClaimableDraws/useDraws'
import { Draw } from 'lib/types/TsunamiTypes'
import { useQuery } from 'react-query'

export const useUsersClaimablePrizes = (claimableDraw: ClaimableDraw) => {
  const { data: draws, isFetched: isDrawsFetched } = useDraws(claimableDraw)
  const usersAddress = useUsersAddress()
  const enabled = Boolean(claimableDraw) && Boolean(usersAddress) && Boolean(isDrawsFetched)
  return useQuery(
    ['useUsersClaimablePrizes', claimableDraw?.id(), usersAddress, draws],
    async () => getUsersClaimablePrizes(claimableDraw, draws, usersAddress),
    { ...NO_REFETCH, enabled }
  )
}

const getUsersClaimablePrizes = async (
  claimableDraw: ClaimableDraw,
  draws: Draw[],
  usersAddress: string
) => {
  const claimablePrizesPromises = draws.map((draw) =>
    claimableDraw.getUsersPrizes(usersAddress, draw)
  )
  const result = await Promise.all(claimablePrizesPromises)
  console.log('getUsersClaimablePrizes', result)
  return result
}
