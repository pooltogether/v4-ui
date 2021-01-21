import { formatUnitsAsWholeNumber } from '../formatUnitsAsWholeNumber'

describe('formatUnitsAsWholeNumber', () => {
  it('works', () => {
    const amount = '1345989877'
    const decimals = 6

    expect(formatUnitsAsWholeNumber(amount, decimals)).toEqual('1345')
  })
})
