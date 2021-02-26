import {
  arrayRegex,
  dataArrayRegex,
  fixedArrayRegex,
  isValidSolidityData,
  tupleRegex
} from '../isValidSolidityData'

const TUPLE_COMPONENTS = [
  {
    name: 'a',
    type: 'address'
  },
  {
    name: 'b',
    type: 'uint256'
  },
  {
    name: 'c',
    type: 'uint256[]'
  }
]

const NESTED_TUPLE_COMPONENTS = [
  {
    name: 'a',
    type: 'tuple',
    components: TUPLE_COMPONENTS
  },
  {
    name: 'b',
    type: 'string'
  }
]

describe('isValidSolidityData', () => {
  it('validates array', () => {
    expect(isValidSolidityData('unit8[]', '[1, 2, 3]')).toEqual(true)
    expect(isValidSolidityData('uint8[]', '["cats", "dogs", "monkeys"]')).toEqual(false)
    expect(
      isValidSolidityData(
        'address[]',
        '["0x27fcf06DcFFdDB6Ec5F62D466987e863ec6aE6A0", "0x27fcf06DcFFdDB6Ec5F62D466987e863ec6aE6A0", "0x27fcf06DcFFdDB6Ec5F62D466987e863ec6aE6A0"]'
      )
    ).toEqual(true)
    expect(isValidSolidityData('string[]', '["cats", "dogs", "monkeys"]')).toEqual(true)
  })

  it('invalidates arrays', () => {
    expect(isValidSolidityData('string[]', '[cats, dogs, monkeys]')).toEqual(false)
    expect(isValidSolidityData('uint8[]', 'AHHHHHHHHHHH')).toEqual(false)
    expect(isValidSolidityData('string[]', 'AHHHHHHHHHHH')).toEqual(false)
    expect(
      isValidSolidityData(
        'address[]',
        '[0x27fcf06DcFFdDB6Ec5F62D466987e863ec6aE6A0, 0x27fcf06DcFFdDB6Ec5F62D466987e863ec6aE6A0, 0x27fcf06DcFFdDB6Ec5F62D466987e863ec6aE6A0]'
      )
    ).toEqual(false)
  })

  it('validates fixed array', () => {
    expect(isValidSolidityData('uint8[3]', '[1, 2, 3]')).toEqual(true)
    expect(isValidSolidityData('uint8[2]', '[1, 2, 3]')).toEqual(false)
    expect(isValidSolidityData('uint8[2]', '1, 2, 3]')).toEqual(false)
  })

  it('validates addresses', () => {
    expect(isValidSolidityData('address', '0x27fcf06DcFFdDB6Ec5F62D466987e863ec6aE6A0')).toEqual(
      true
    )
    expect(isValidSolidityData('address', '0x27fcf06DcFFdDB6Ec5F62D466987e863ec6aE6A')).toEqual(
      false
    )
  })

  it('validates correct tuples', () => {
    expect(
      isValidSolidityData(
        'tuple',
        '{"a":"0x27fcf06DcFFdDB6Ec5F62D466987e863ec6aE6A0","b":12,"c":["1","1"]}',
        TUPLE_COMPONENTS
      )
    ).toEqual(true)
    expect(isValidSolidityData('tuple', '{"a":"","b":12,"c":["1","1"]}', TUPLE_COMPONENTS)).toEqual(
      true
    )
    expect(
      isValidSolidityData(
        'tuple',
        '{"a":"0x27fcf06DcFFdDB6Ec5F62D466987e863ec6aE6A0","b":12,"c":[]}',
        TUPLE_COMPONENTS
      )
    ).toEqual(true)
  })

  it('invalidates tuples', () => {
    expect(isValidSolidityData('tuple', 'moooooooo', TUPLE_COMPONENTS)).toEqual(false)
    expect(
      isValidSolidityData('tuple', '{"a":"quack","b":12,"c":["1","1"]}', TUPLE_COMPONENTS)
    ).toEqual(false)
    expect(
      isValidSolidityData(
        'tuple',
        '{"a":"0x27fcf06DcFFdDB6Ec5F62D466987e863ec6aE6A0","b":12,"c":["moo"]}',
        TUPLE_COMPONENTS
      )
    ).toEqual(false)
    expect(
      isValidSolidityData(
        'tuple',
        '{"a":"0x27fcf06DcFFdDB6Ec5F62D466987e863ec6aE6A0","b":12}',
        TUPLE_COMPONENTS
      )
    ).toEqual(false)
  })

  it('validates nested tuples', () => {
    expect(
      isValidSolidityData(
        'tuple',
        '{"a":{"a":"0x27fcf06DcFFdDB6Ec5F62D466987e863ec6aE6A0","b":12,"c":[1]},"b":"woof"}',
        NESTED_TUPLE_COMPONENTS
      )
    ).toEqual(true)
  })

  it('invalidates nested tuples', () => {
    expect(isValidSolidityData('tuple', 'moooooooo', NESTED_TUPLE_COMPONENTS)).toEqual(false)
    expect(
      isValidSolidityData(
        'tuple',
        '{"a":{"a":null,"b":12,"c":[1]},"b":"woof"}',
        NESTED_TUPLE_COMPONENTS
      )
    ).toEqual(false)
  })
})

describe('Regex for validating solidity data types', () => {
  it('dataArrayRegex', () => {
    expect(dataArrayRegex.test('[]')).toEqual(true)
    expect(dataArrayRegex.test('[quack]')).toEqual(true)
    expect(dataArrayRegex.test('cats')).toEqual(false)
    expect(dataArrayRegex.test('[ducks')).toEqual(false)
  })
  it('tupleRegex', () => {
    expect(tupleRegex.test('()')).toEqual(true)
    expect(tupleRegex.test('(int8)')).toEqual(true)
    expect(tupleRegex.test('(int8,string)')).toEqual(true)
    expect(tupleRegex.test('(int8,string')).toEqual(false)
    expect(tupleRegex.test('int8')).toEqual(false)
  })
  it('arrayRegex', () => {
    expect(arrayRegex.test('uint[]')).toEqual(true)
    expect(arrayRegex.test('string[]')).toEqual(true)
    expect(arrayRegex.test('string[2]')).toEqual(false)
    expect(arrayRegex.test('string')).toEqual(false)
  })
  it('fixedArrayRegex', () => {
    expect(fixedArrayRegex.test('uint[2]')).toEqual(true)
    expect(fixedArrayRegex.test('uint[200]')).toEqual(true)
    expect(fixedArrayRegex.test('uint[]')).toEqual(false)
    expect(fixedArrayRegex.test('string')).toEqual(false)
  })
})
