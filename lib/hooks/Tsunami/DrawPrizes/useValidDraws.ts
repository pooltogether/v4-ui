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
  const r = await drawPrize.getValidDraws()
  return r
}
