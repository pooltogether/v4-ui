import { PrizeDistributor } from '@pooltogether/v4-client-js'
import { useUsersUnclaimedDrawDatas } from './useUsersUnclaimedDrawDatas'

export const useUnclaimedDrawIds = (usersAddress: string, prizeDistributor: PrizeDistributor) => {
  const {
    data: unclaimedDrawDatas,
    isFetched,
    ...useQueryResponse
  } = useUsersUnclaimedDrawDatas(usersAddress, prizeDistributor)

  if (!isFetched || !unclaimedDrawDatas?.[usersAddress]) {
    return { data: null, isFetched, ...useQueryResponse }
  }

  const drawDatas = unclaimedDrawDatas[usersAddress]
  const drawIds = drawDatas ? Object.keys(drawDatas).map(Number) : null

  return { data: drawIds, isFetched, ...useQueryResponse }
}
