import { useAtom } from 'jotai'
import { lockedDrawIdsAtom } from './useLockedDrawIdsWatcher'

/**
 * useLockedDrawIds depends on useLockedDrawIdsWatcher to update the atom when draws unlock
 * @returns {number[]}
 */
export const useLockedDrawIds = () => {
  const [lockedDrawIds] = useAtom(lockedDrawIdsAtom)
  return lockedDrawIds
}
