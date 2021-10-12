import { PrizeDistribution } from '@pooltogether/v4-js-client'
import { BigNumber } from '@ethersproject/bignumber'
import { parseUnits } from '@ethersproject/units'

export const DECIMALS_FOR_DISTRIBUTION_TIERS = '9'

export const TSUNAMI_USDC_PRIZE_DISTRIBUTION: PrizeDistribution = Object.freeze({
  matchCardinality: 10,
  tiers: [183418928, 0, 0, 315480557, 0, 501100513, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
  bitRangeSize: 2,
  maxPicksPerUser: 2,
  numberOfPicks: BigNumber.from(0x080000),
  prize: BigNumber.from(0x032c694b80),
  drawStartTimestampOffset: 0,
  drawEndTimestampOffset: 0
})
