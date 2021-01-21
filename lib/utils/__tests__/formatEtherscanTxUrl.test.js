import { formatEtherscanTxUrl } from '../formatEtherscanTxUrl'

describe('formatEtherscanTxUrl', () => {
  it('works', () => {
    const hash = '0x9876'
    const networkId = 3
    expect(formatEtherscanTxUrl(hash, networkId)).toEqual('https://ropsten.etherscan.io/tx/0x9876')
  })

  it('works for rinkeby', () => {
    const hash = '0xab63'
    const networkId = 4
    expect(formatEtherscanTxUrl(hash, networkId)).toEqual('https://rinkeby.etherscan.io/tx/0xab63')
  })

  it('works for rinkeby', () => {
    const hash = '0x1298'
    const networkId = 42
    expect(formatEtherscanTxUrl(hash, networkId)).toEqual('https://kovan.etherscan.io/tx/0x1298')
  })

  it('works for mainnet', () => {
    const hash = '0x1234'
    const networkId = 54
    expect(formatEtherscanTxUrl(hash, networkId)).toEqual('https://etherscan.io/tx/0x1234')
  })
})
