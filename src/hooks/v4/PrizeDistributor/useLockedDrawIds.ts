import { dedupeArray } from '@pooltogether/utilities'
import { useDrawLocks } from './useDrawLocks'

export const useLockedDrawIds = () => {
  const queryResults = useDrawLocks()
  return dedupeArray(
    queryResults
      .filter(({ isFetched, isError, data }) => isFetched && !isError && data !== null)
      .map(({ data }) => data.drawId)
  )
}
