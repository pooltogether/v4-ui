import { formatEtherscanAddressUrl } from '../formatEtherscanAddressUrl'

describe('formatEtherscanAddressUrl', () => {
  it('should default to mainnet if no network id is passed', () => {
    expect(formatEtherscanAddressUrl('0x1234')).toEqual('https://etherscan.io/address/0x1234')
  })

  it('should support kovan', () => {
    expect(formatEtherscanAddressUrl('0x1234', 42)).toEqual(
      'https://kovan.etherscan.io/address/0x1234'
    )
  })

  it('should support ropsten', () => {
    expect(formatEtherscanAddressUrl('0x1234', 3)).toEqual(
      'https://ropsten.etherscan.io/address/0x1234'
    )
  })

  it('should support rinkeby', () => {
    expect(formatEtherscanAddressUrl('0x1234', 4)).toEqual(
      'https://rinkeby.etherscan.io/address/0x1234'
    )
  })

  it('should support kovan', () => {
    expect(formatEtherscanAddressUrl('0x1234', 42)).toEqual(
      'https://kovan.etherscan.io/address/0x1234'
    )
  })
})
