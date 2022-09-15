import { msToS, sToMs } from '@pooltogether/utilities'
import { atom, useAtom } from 'jotai'
import { useEffect } from 'react'

import { useDrawLocks } from './useDrawLocks'

export const lockedDrawIdsAtom = atom<number[]>([])

const removeLockedDrawIdAtom = atom(null, (get, set, drawId: number) => {
  const lockedDrawIds = get(lockedDrawIdsAtom)
  set(
    lockedDrawIdsAtom,
    lockedDrawIds.filter((id) => id !== drawId)
  )
})

export const useLockedDrawIdsWatcher = () => {
  const { data: drawLocks } = useDrawLocks()
  const [, setLockedDrawIds] = useAtom(lockedDrawIdsAtom)
  const [, removeLockedDrawId] = useAtom(removeLockedDrawIdAtom)

  useEffect(() => {
    const drawIds = drawLocks && Object.keys(drawLocks).map(Number)
    if (!drawLocks || drawIds.length === 0) {
      setLockedDrawIds([])
      return
    }

    const lockedDrawIds = []
    const timeouts: NodeJS.Timeout[] = []

    drawIds.forEach((drawId) => {
      const drawLock = drawLocks[drawId]
      const endTimeSeconds = drawLock.endTimeSeconds.toNumber()
      const currentTimeSeconds = Math.round(msToS(Date.now()))
      if (endTimeSeconds > currentTimeSeconds) {
        lockedDrawIds.push(drawId)
        const timeDelayMs = sToMs(endTimeSeconds - currentTimeSeconds)
        const timeout = setTimeout(() => {
          removeLockedDrawId(drawId)
        }, timeDelayMs)
        timeouts.push(timeout)
      }
    })

    setLockedDrawIds(lockedDrawIds)
    return () => {
      timeouts.forEach((timeout) => clearTimeout(timeout))
    }
  }, [drawLocks])
}
