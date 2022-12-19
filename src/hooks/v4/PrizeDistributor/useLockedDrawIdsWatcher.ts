import { dedupeArray, msToS, sToMs } from '@pooltogether/utilities'
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
    const drawIds = drawLocks && dedupeArray(drawLocks.map(({ drawId }) => drawId))
    if (!drawLocks || drawIds.length === 0) {
      setLockedDrawIds([])
      return
    }

    const lockedDrawIds = []
    const timeouts: NodeJS.Timeout[] = []

    drawIds.forEach((drawId) => {
      // NOTE: There's multiples of the same drawId, so we need to find the one with the earliest endTimeSeconds
      const drawLock = drawLocks
        .filter((dl) => dl.drawId === drawId)
        .sort((a, b) => a.endTimeSeconds.sub(b.endTimeSeconds).toNumber())[0]
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
