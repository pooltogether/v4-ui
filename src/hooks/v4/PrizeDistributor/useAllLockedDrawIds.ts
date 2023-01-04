import { dedupeArray } from '@pooltogether/utilities'
import { useAllDrawLocks } from './useAllDrawLocks'

export const useAllLockedDrawIds = () => {
  const queryResults = useAllDrawLocks()
  return dedupeArray(
    queryResults
      .filter(({ isFetched, isError, data }) => isFetched && !isError && data !== null)
      .map(({ data }) => data.drawId)
  )
}
