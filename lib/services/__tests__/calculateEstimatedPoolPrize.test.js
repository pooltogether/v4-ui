import { ethers } from 'ethers'

import { calculateEstimatedPoolPrize } from '../calculateEstimatedPoolPrize'

const bn = ethers.utils.bigNumberify

describe('calculateEstimatedPoolPrize', () => {
  it('returns 0 if loading data', () => {
    const result = calculateEstimatedPoolPrize({
      underlyingCollateralDecimals: undefined,
      awardBalance: undefined,
      ticketSupply: undefined,
      totalSponsorship: undefined,
      supplyRatePerBlock: undefined,
      prizePeriodRemainingSeconds: undefined,
    })

    expect(result.toString()).toEqual('0.00')
  })

  it('returns the correct estimate for a default 18 token precision set of contracts', () => {
    const ticketSupply = ethers.utils.parseEther('4000000')
    const totalSponsorship = ethers.utils.parseEther('1000000')

    const result = calculateEstimatedPoolPrize({
      ticketSupply,
      totalSponsorship,
      awardBalance: ethers.utils.parseEther('200'),
      supplyRatePerBlock: bn('123456701'),
      prizePeriodRemainingSeconds: bn('3600'),
    })

    expect(result.toString()).toEqual('200.15')
  })

  it('returns the correct estimate for a 6 decimal precision set of contracts', () => {
    const ticketSupply = '6000000'
    const totalSponsorship = '3000000'

    const underlyingCollateralDecimals = '6'

    const result = calculateEstimatedPoolPrize({
      ticketSupply,
      totalSponsorship,
      underlyingCollateralDecimals,
      awardBalance: bn('43400000'),
      supplyRatePerBlock: bn('93834104901'),
      prizePeriodRemainingSeconds: bn('500'),
    })

    expect(result.toString()).toEqual('43.40')
  })
})
