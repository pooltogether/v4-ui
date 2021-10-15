import { PrizeDistribution } from '@pooltogether/v4-js-client'
import { BigNumber } from '@ethersproject/bignumber'
import { parseUnits } from '@ethersproject/units'

export const DECIMALS_FOR_DISTRIBUTION_TIERS = '9'

export const TSUNAMI_USDC_PRIZE_DISTRIBUTION: PrizeDistribution = Object.freeze({
  bitRangeSize: 2,
  tiers: [166889185, 0, 0, 320427236, 0, 512683578, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
  maxPicksPerUser: 2,
  matchCardinality: 7,
  numberOfPicks: BigNumber.from(0x1b3b),
  prize: BigNumber.from(0x037ce0a900),
  drawStartTimestampOffset: 0,
  drawEndTimestampOffset: 0
})
