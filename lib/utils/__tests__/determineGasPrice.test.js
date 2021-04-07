import { ethers } from 'ethers'

import { determineGasPrice } from '../determineGasPrice'

const bn = ethers.BigNumber.from

describe('determineGasPrice', () => {
  it('returns a safe default if query loading / not available', () => {
    let gasStationQuery = {}

    expect(determineGasPrice(gasStationQuery)).toEqual(bn(15100000000))
  })

  it('returns averagePlusOne if gas costs over 15', () => {
    const gasStationQuery = {
      gasStation: {
        gasPrices: {
          average: bn(22),
          averagePlusOne: bn(23)
        }
      }
    }

    expect(determineGasPrice(gasStationQuery)).toEqual(bn(23))
  })

  it('returns fastestPlusOne if gas costs under 15', () => {
    const gasStationQuery = {
      gasStation: {
        gasPrices: {
          average: bn(12),
          fastestPlusOne: bn(17)
        }
      }
    }

    expect(determineGasPrice(gasStationQuery)).toEqual(bn(17))
  })
})
