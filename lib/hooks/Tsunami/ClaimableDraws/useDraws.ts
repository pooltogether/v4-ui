import { ClaimableDraw } from '.yalc/@pooltogether/v4-js-client/dist'
import { NO_REFETCH } from 'lib/constants/queryKeys'
import { Draw } from 'lib/types/TsunamiTypes'
import { useQuery } from 'react-query'

export const useDraws = (claimableDraw: ClaimableDraw) => {
  const enabled = Boolean(claimableDraw)
  return useQuery(['useDraws', claimableDraw?.id()], async () => getDraws(claimableDraw), {
    ...NO_REFETCH,
    enabled
  })
}

const getDraws = async (claimableDraw: ClaimableDraw): Promise<Draw[]> => {
  // const draws = await claimableDraw.getDraws()
  // console.log('draws', draws)
  // const r = await claimableDraw.getDraws()
  // console.log('getDraws', r)

  const oldest = await claimableDraw.getOldestDraw()
  // const newest = await claimableDraw.getNewestDraw()

  console.log('getDraws', oldest)

  return [oldest]
}
