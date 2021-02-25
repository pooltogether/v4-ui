import {
  arrayRegex,
  dataArrayRegex,
  fixedArrayRegex,
  isValidSolidityData,
  tupleRegex
} from '../isValidSolidityData'

describe('isValidSolidityData', () => {
  it('validates array', () => {
    expect(isValidSolidityData('unit8[]', '[1, 2, 3]')).toEqual(true)
    expect(isValidSolidityData('uint8[]', '["cats", "dogs", "monkeys"]')).toEqual(false)
    expect(isValidSolidityData('string[]', '["cats", "dogs", "monkeys"]')).toEqual(true)
    expect(isValidSolidityData('string[]', '[cats, dogs, monkeys]')).toEqual(false)
    expect(isValidSolidityData('uint8[]', 'AHHHHHHHHHHH')).toEqual(false)
    expect(isValidSolidityData('string[]', 'AHHHHHHHHHHH')).toEqual(false)
  })

  it('validates fixed array', () => {
    expect(isValidSolidityData('uint8[3]', '[1, 2, 3]')).toEqual(true)
    expect(isValidSolidityData('uint8[2]', '[1, 2, 3]')).toEqual(false)
    expect(isValidSolidityData('uint8[2]', '1, 2, 3]')).toEqual(false)
  })

  // it('validates correct tuples', () => {
  //   expect(isValidSolidityData('(int8,string,unit8)', 'MONKEY')).toEqual(true)
  //   expect(isValidSolidityData('(int8)', '1')).toEqual(true)
  //   // expect(isValidSolidityData('(int8, string)', '1')).toEqual(true)
  //   expect(isValidSolidityData('(int8, string[])', '[]')).toEqual(true)
  //   // expect(isValidSolidityData('((string[],int8[]),string)', '[]')).toEqual(true)
  //   // expect(isValidSolidityData('((int8,int16),(uint8,uint16))', '10')).toEqual(true)
  // })

  // it('validates incorrect tuples', () => {
  //   expect(isValidSolidityData('(int8)', 'cats')).toEqual(false)
  //   expect(isValidSolidityData('(int8, int32)', '[1]')).toEqual(false)
  //   expect(isValidSolidityData('(string[])', 'duck')).toEqual(false)
  //   expect(isValidSolidityData('(int8[])', '[duck]')).toEqual(false)
  //   expect(isValidSolidityData('((int8,int16),(uint8,uint16))', '[]')).toEqual(false)
  //   expect(isValidSolidityData('(int8,int16,uint8,uint16)', '[]')).toEqual(false)
  //   expect(isValidSolidityData('((int8,int16),(uint8,uint16))', 'cats')).toEqual(false)
  // })
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
