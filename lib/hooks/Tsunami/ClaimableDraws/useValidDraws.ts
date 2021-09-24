import { ClaimableDraw, Draw } from '@pooltogether/v4-js-client'
import { NO_REFETCH } from 'lib/constants/queryKeys'
import { useQuery } from 'react-query'

export const useValidDraws = (claimableDraw: ClaimableDraw) => {
  const enabled = Boolean(claimableDraw)
  return useQuery(['useDraws', claimableDraw?.id()], async () => getValidDrawIds(claimableDraw), {
    ...NO_REFETCH,
    enabled
  })
}

const getValidDrawIds = async (claimableDraw: ClaimableDraw): Promise<Draw[]> => {
  // const draws = await claimableDraw.getDraws()
  // console.log('draws', draws)
  const r = await claimableDraw.getValidDraws()
  console.log('claimableDraw', claimableDraw)
  console.log('getDraws', r)
  return r
}
