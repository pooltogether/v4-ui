import SingleRandomWinnerAbi from '@pooltogether/pooltogether-contracts/abis/SingleRandomWinner'
import MultipleWinnersAbi from '@pooltogether/pooltogether-contracts/abis/MultipleWinners'

import { PRIZE_STRATEGY_TYPES } from 'lib/constants'

export const getPrizeStrategyAbiFromPool = (pool) => {
  return pool?.prizeStrategyType === PRIZE_STRATEGY_TYPES['singleRandomWinner'] ?
    SingleRandomWinnerAbi :
    MultipleWinnersAbi
}