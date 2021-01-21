import { displayPercentage } from '../displayPercentage'

describe('displayPercentage', () => {
  it('works as expected', () => {
    expect(displayPercentage('12.4213434')).toEqual('12.42')

    expect(displayPercentage('12.00123128497')).toEqual('12')
  })
})
