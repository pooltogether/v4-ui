import { ethers } from 'ethers'

import { displayAmountWithOptionalZeroes } from '../displayAmountWithOptionalZeroes'

describe('displayAmountWithOptionalZeroes', () => {
  it('is accurate (it is known)', () => {
    expect(
      displayAmountWithOptionalZeroes(
        ethers.utils.bigNumberify('300000000000000000')
      )
    ).toEqual('0.3')

    expect(
      displayAmountWithOptionalZeroes(
        ethers.utils.bigNumberify('66000000000000000'),
      )
    ).toEqual('0.06')

    expect(
      displayAmountWithOptionalZeroes(
        ethers.utils.bigNumberify('66000000000000000'),
        { totalPossibleDecimalPlaces: 1 }
      )
    ).toEqual('0.0')

    expect(
      displayAmountWithOptionalZeroes(
        ethers.utils.bigNumberify('7000000000000000'),
        { totalPossibleDecimalPlaces: 4 }
      )
    ).toEqual('0.007')

    expect(
      displayAmountWithOptionalZeroes(
        ethers.utils.bigNumberify('930000000000000'),
        { totalPossibleDecimalPlaces: 4 }
      )
    ).toEqual('0.0009')

    expect(
      displayAmountWithOptionalZeroes(
        ethers.utils.bigNumberify('40000000000000'),
        { totalPossibleDecimalPlaces: 5 }
      )
    ).toEqual('0.00004')

  })
})
