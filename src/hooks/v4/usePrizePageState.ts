import { PrizeDistributor } from '@pooltogether/v4-client-js'
import { useEffect, useMemo, useState } from 'react'
import { useHasUserCheckedAllDraws } from './PrizeDistributor/useHasUserCheckedAllDraws'
import { useLockedPartialDrawDatas } from './PrizeDistributor/useLockedPartialDrawDatas'
import { usePropagatingDraws } from './PrizeDistributor/usePropagatingDraws'

export enum CheckedState {
  unchecked,
  checking,
  checked
}

export enum PrizePageState {
  loading = 'loading',
  drawsToCheck = 'drawsToCheck',
  lockedDraws = 'lockedDraws',
  propagatingDraws = 'propagatingDraws',
  noDraws = 'noDraws'
}

/**
 * There's several states the Prize Page can be in that need to be shared across several components:
 * - Loading
 * - Wallet not connected
 * 		- Locked Draw
 * 		- Propagating Draws
 * 		- No Draws
 * - Wallet connected
 * 		- Prizes to check
 * 		- No prizes to check
 * 			- Locked Draw
 *			- Propagating Draws
 *			- No Draws
 */
export const usePrizePageState = (usersAddress: string, prizeDistributor: PrizeDistributor) => {
  const [checkedState, setCheckedState] = useState<CheckedState>(CheckedState.unchecked)
  const { data: checkedDrawsData, isFetched: isCheckedDrawsFetched } = useHasUserCheckedAllDraws(
    usersAddress,
    prizeDistributor
  )
  const lockedPartialDrawDatas = useLockedPartialDrawDatas(prizeDistributor)
  const { data: propagatingDraws, isFetched: isPropagatingDrawsFetched } =
    usePropagatingDraws(prizeDistributor)

  // Reset checked state when prize distributor or wallet changes
  useEffect(() => {
    setCheckedState(CheckedState.unchecked)
  }, [prizeDistributor, usersAddress])

  return useMemo(() => {
    if (
      (!!usersAddress && !isCheckedDrawsFetched) ||
      !isPropagatingDrawsFetched ||
      !lockedPartialDrawDatas
    ) {
      return {
        state: PrizePageState.loading,
        checkedState,
        setCheckedState
      }
    }

    if (!!usersAddress) {
      const { hasUserCheckedAllDraws } = checkedDrawsData
      if (!hasUserCheckedAllDraws) {
        return { state: PrizePageState.drawsToCheck, checkedState, setCheckedState }
      }
    }

    if (Object.keys(propagatingDraws).length > 0) {
      return { state: PrizePageState.propagatingDraws, checkedState, setCheckedState }
    }

    const lockedPartialDrawDatasList = Object.values(lockedPartialDrawDatas)
    if (lockedPartialDrawDatasList.length > 0) {
      return { state: PrizePageState.lockedDraws, checkedState, setCheckedState }
    }

    return { state: PrizePageState.noDraws, checkedState, setCheckedState }
  }, [
    usersAddress,
    checkedDrawsData?.hasUserCheckedAllDraws,
    isCheckedDrawsFetched,
    isPropagatingDrawsFetched,
    lockedPartialDrawDatas,
    propagatingDraws,
    checkedState
  ])
}
