import { ethers } from 'ethers'
import { getEmptySolidityDataTypeValue } from '../getEmptySolidityDataTypeValue'

// expect(isValidSolidityData()).toEqual(true)

describe('getEmptySolidityDataTypeValue', () => {
  it('default array', () => {
    expect(getEmptySolidityDataTypeValue('unit8[]')).toEqual([])
    expect(getEmptySolidityDataTypeValue('string[]')).toEqual([])
    expect(getEmptySolidityDataTypeValue('uint8[2]')).toEqual([])
    expect(getEmptySolidityDataTypeValue('uint8[30]')).toEqual([])
  })

  it('default int/uint', () => {
    expect(getEmptySolidityDataTypeValue('uint')).toEqual(0)
    expect(getEmptySolidityDataTypeValue('int')).toEqual(0)
    expect(getEmptySolidityDataTypeValue('int8')).toEqual(0)
    expect(getEmptySolidityDataTypeValue('uint8')).toEqual(0)
    expect(getEmptySolidityDataTypeValue('int256')).toEqual(0)
    expect(getEmptySolidityDataTypeValue('uint256')).toEqual(0)
  })

  it('default fixed/ufixed', () => {
    expect(getEmptySolidityDataTypeValue('fixed')).toEqual(0)
    expect(getEmptySolidityDataTypeValue('ufixed')).toEqual(0)
    expect(getEmptySolidityDataTypeValue('fixed8')).toEqual(0)
    expect(getEmptySolidityDataTypeValue('ufixed8')).toEqual(0)
  })

  it('default string', () => {
    expect(getEmptySolidityDataTypeValue('string')).toEqual('')
  })

  it('default bytes', () => {
    expect(getEmptySolidityDataTypeValue('bytes')).toEqual('')
    expect(getEmptySolidityDataTypeValue('bytes8')).toEqual('')
  })

  it('default function', () => {
    expect(getEmptySolidityDataTypeValue('function')).toEqual('')
  })

  it('default address', () => {
    expect(getEmptySolidityDataTypeValue('address')).toEqual(ethers.constants.AddressZero)
  })

  it('default boolean', () => {
    expect(getEmptySolidityDataTypeValue('bool')).toEqual(false)
  })
})
