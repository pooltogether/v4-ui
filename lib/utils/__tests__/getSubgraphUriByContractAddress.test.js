import { getSubgraphUriByContractAddress } from '../getSubgraphUriByContractAddress'

describe('getSubgraphUriByContractAddress', () => {
  describe('rinkeby', () => {
    const chainId = 4

      xit('is subgraph URI for the cDai pool with staging subgraph', () => {
        const contractAddress = '0x4706856fa8bb747d50b4ef8547fe51ab5edc4ac2'

        expect(
          getSubgraphUriByContractAddress(chainId, contractAddress)
        ).toEqual('https://api.thegraph.com/subgraphs/name/pooltogether/rinkeby-staging-v3_0_1')
      })

      xit('is subgraph URI for the cDai pool', () => {
        const contractAddress = '0x4706856fa8bb747d50b4ef8547fe51ab5edc4ac2'

        expect(
          getSubgraphUriByContractAddress(chainId, contractAddress, 'production')
        ).toEqual('https://api.thegraph.com/subgraphs/name/pooltogether/rinkeby-v3_0_1')
      })

      xit('is subgraph URI cDai strategy with staging subgraph', () => {
        const contractAddress = '0x5e0a6d336667eace5d1b33279b50055604c3e329'

        expect(
          getSubgraphUriByContractAddress(chainId, contractAddress)
        ).toEqual('https://api.thegraph.com/subgraphs/name/pooltogether/rinkeby-staging-v3_1_0')
      })

      xit('is subgraph URI cDai strategy', () => {
        const contractAddress = '0x5e0a6d336667eace5d1b33279b50055604c3e329'

        expect(
          getSubgraphUriByContractAddress(chainId, contractAddress, 'production')
        ).toEqual('https://api.thegraph.com/subgraphs/name/pooltogether/rinkeby-v3_1_0')
      })

  })
})
