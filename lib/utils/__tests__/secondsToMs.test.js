import { ethers } from 'ethers'
import { secondsToMs } from '../secondsToMs'

describe('secondsToMs', () => {
  it('works with strings', () => {
    expect(secondsToMs('1')).toEqual(ethers.BigNumber.from(1000))
  })

  it('works with numbers', () => {
    expect(secondsToMs(1)).toEqual(ethers.BigNumber.from(1000))
  })

  it('works with big numbers', () => {
    expect(secondsToMs(ethers.BigNumber.from(1))).toEqual(ethers.BigNumber.from(1000))
  })

  it('ignores dates', () => {
    const date = new Date()
    expect(secondsToMs(date)).toEqual(date)
  })
})
