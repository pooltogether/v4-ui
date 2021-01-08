import { shorten } from '../shorten'

describe('shorten', () => {
  it('should work', () => {
    expect(shorten('0x1234567890')).toEqual('0x1234..7890')
  })
})
