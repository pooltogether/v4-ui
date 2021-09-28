import { DrawPrize, Draw } from '@pooltogether/v4-js-client'
import { NO_REFETCH } from 'lib/constants/queryKeys'
import { useQuery } from 'react-query'

export const useValidDraws = (drawPrize: DrawPrize) => {
  const enabled = Boolean(drawPrize)
  return useQuery(['useDraws', drawPrize?.id()], async () => getValidDrawIds(drawPrize), {
    ...NO_REFETCH,
    enabled
  })
}

const getValidDrawIds = async (drawPrize: DrawPrize): Promise<Draw[]> => {
  // const draws = await drawPrize.getDraws()
  // console.log('draws', draws)
  const r = await drawPrize.getValidDraws()
  console.log('drawPrize', drawPrize)
  console.log('getDraws', r)
  return r
}
