import { isValidSolidityData } from '../isValidSolidityData'

// expect(isValidSolidityData()).toEqual(true)

describe('isValidSolidityData', () => {
  it('validates array', () => {
    expect(isValidSolidityData('unit8[]', '[1, 2, 3]')).toEqual(true)
    expect(isValidSolidityData('uint8[]', '[cats, dogs, monkeys]')).toEqual(false)
    expect(isValidSolidityData('uint8[]', 'AHHHHHHHHHHH')).toEqual(false)
  })

  it('validates fixed array', () => {
    expect(isValidSolidityData('uint8[3]', '[1, 2, 3]')).toEqual(true)
    expect(isValidSolidityData('uint8[2]', '[1, 2, 3]')).toEqual(false)
  })

