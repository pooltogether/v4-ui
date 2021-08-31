import { usePrizePool } from 'lib/hooks/usePrizePool'
import { CurrentPrizePeriod } from 'lib/types/TsunamiTypes'

export const useCurrentPrizePeriod = () => {
  const prizePool = usePrizePool()

  return {
    data: {
      drawId: 4,
      state: 'active',
      _prizePeriodSeconds: 604800,
      _prizePeriodRemainingSeconds: 604800, // WRong but good enough for now
      _prizePeriodStartedAt: 1630072865,
      _canStartAward: false,
      _canCompelteAward: false,
      _isRngRequested: false,
      _isRngTimedOut: false,
      _isRngCompleted: false
    } as CurrentPrizePeriod,
    isFetched: true
  }
}
