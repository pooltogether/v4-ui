import { displayAmountInEther } from '../displayAmountInEther'

describe('displayAmountInEther', () => {
  it('should show two decimal points and commas by default', () => {
    expect(displayAmountInEther('1000300000000000000000')).toEqual('1,000.30')
  })

  it('should default to 18 decimal precision (wei)', () => {
    expect(displayAmountInEther('332000300000000000000000')).toEqual('332,000.30')
  })

  it('should show no decimal points with precision set', () => {
    expect(
      displayAmountInEther('1000000000000000000000000', {
        precision: 0
      })
    ).toEqual('1,000,000')
  })

  it('should show no commas and 5 decimal points with options', () => {
    expect(
      displayAmountInEther('1000000345670000000000', {
        precision: 5,
        commify: false
      })
    ).toEqual('1000.00034')
  })

  it('should accept alternative decimal precisions', () => {
    expect(
      displayAmountInEther('12345678', {
        decimals: 6,
        precision: 5
      })
    ).toEqual('12.34567')
  })
})
