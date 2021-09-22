import { useUsersAddress } from '.yalc/@pooltogether/hooks/dist'
import { ClaimableDraw } from '.yalc/@pooltogether/v4-js-client/dist'
import { Draw } from '@pooltogether/draw-calculator-js-sdk'
import { NO_REFETCH } from 'lib/constants/queryKeys'
import { useValidDraws } from 'lib/hooks/Tsunami/ClaimableDraws/useValidDraws'
import { useQuery } from 'react-query'

export const useUsersClaimablePrizes = (claimableDraw: ClaimableDraw) => {
  const { data: draws, isFetched: isDrawsFetched } = useValidDraws(claimableDraw)
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
