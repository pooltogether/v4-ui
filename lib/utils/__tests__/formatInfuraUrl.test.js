import { formatInfuraUrl } from '../formatInfuraUrl'

describe('formatInfuraUrl', () => {
  it('works', () => {
    const appId = '1234abcd'
    const chainId = 4
    expect(formatInfuraUrl(appId, chainId)).toEqual('https://rinkeby.infura.io/v3/1234abcd')
  })
})
