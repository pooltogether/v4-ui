import { CHAIN_ID } from './constants'

// List of V3 prize pools to maintain withdrawal support for
export const V3_PRIZE_POOL_ADDRESSES: {
  [chainId: number]: {
    prizePool: string
    symbol: string
    subgraphVersion: string
    tokenFaucets?: string[]
  }[]
} = {
  [CHAIN_ID.mainnet]: [
    {
      prizePool: '0xebfb47a7ad0fd6e57323c8a42b2e5a6a4f68fc1a',
      symbol: 'PT-cDAI',
      subgraphVersion: '3.1.0',
      tokenFaucets: ['0xf362ce295f2a4eae4348ffc8cdbce8d729ccb8eb']
    },
    {
      prizePool: '0x0650d780292142835f6ac58dd8e2a336e87b4393',
      symbol: 'PT-cUNI',
      subgraphVersion: '3.1.0',
      tokenFaucets: ['0xa5dddefd30e234be2ac6fc1a0364cfd337aa0f61']
    },
    {
      prizePool: '0xde9ec95d7708b8319ccca4b8bc92c0a3b70bf416',
      symbol: 'PT-cUSDC',
      subgraphVersion: '3.1.0',
      tokenFaucets: ['0xbd537257fad96e977b9e545be583bbf7028f30b9']
    },
    {
      prizePool: '0x396b4489da692788e327e2e4b2b0459a5ef26791',
      symbol: 'PT-stPOOL',
      subgraphVersion: '3.3.2',
      tokenFaucets: ['0x30430419b86e9512e6d93fc2b0791d98dbeb637b']
    },
    {
      prizePool: '0xbc82221e131c082336cf698f0ca3ebd18afd4ce7',
      symbol: 'PT-cCOMP',
      subgraphVersion: '3.1.0',
      tokenFaucets: ['0x72f06a78bbaac0489067a1973b0cef61841d58bc']
    },
    {
      prizePool: '0xc2a7dfb76e93d12a1bb1fa151b9900158090395d',
      symbol: 'PT-stBADGER',
      subgraphVersion: '3.3.2',
      tokenFaucets: ['0x40f76363129118b34cc2af44963192c3e8690ba6']
    },
    {
      prizePool: '0xc32a0f9dfe2d93e8a60ba0200e033a59aec91559',
      symbol: 'PT-xSUSHI',
      subgraphVersion: '3.3.8',
      tokenFaucets: [
        '0xddcf915656471b7c44217fb8c51f9888701e759a',
        '0xd186302304fd367488b5087af5b12cb9b7cf7540'
      ]
    },
    {
      prizePool: '0x3af7072d29adde20fc7e173a7cb9e45307d2fb0a',
      symbol: 'POOL-ETH-UNI-V2-LP',
      subgraphVersion: '3.3.8',
      tokenFaucets: ['0x9a29401ef1856b669f55ae5b24505b3b6faeb370']
    },
    {
      prizePool: '0x65c8827229fbd63f9de9fdfd400c9d264066a336',
      symbol: 'gUSD-0x65C882',
      subgraphVersion: '3.3.8'
    },
    {
      prizePool: '0x103a8ed831bec3b33a0018a16337fbfd604bbba9',
      symbol: 'RAI-0x103a8e',
      subgraphVersion: '3.3.8'
    },
    {
      prizePool: '0x5b746a07d36a9c8583313983d83d2fc029dcf7bf',
      symbol: 'sUSD-0x5b746a',
      subgraphVersion: '3.3.8'
    },
    {
      prizePool: '0x244d223c0ad484aa27691c4efd2218a71b240c8c',
      symbol: 'bUSD-0x244D22',
      subgraphVersion: '3.3.8'
    },
    {
      prizePool: '0x639d4140a1f7723b7cefef7505d1d7be11a43de0',
      symbol: 'UNI-V2-0x639d41',
      subgraphVersion: '3.1.0'
    },
    {
      prizePool: '0xc7d56c06F136EFff93e349C7BF8cc46bBF5D902c',
      symbol: 'USDT-0xc7d56c',
      subgraphVersion: '3.3.8'
    }
  ],
  [CHAIN_ID.rinkeby]: [
    {
      prizePool: '0x4706856fa8bb747d50b4ef8547fe51ab5edc4ac2',
      symbol: 'PT-cDAI',
      subgraphVersion: '3.1.0',
      tokenFaucets: ['0x5d5af77cf99f7015e615f9b3286a27c5b6090707']
    },
    {
      prizePool: '0xab068f220e10eed899b54f1113de7e354c9a8eb7',
      symbol: 'PT-cBAT',
      subgraphVersion: '3.1.0',
      tokenFaucets: ['0x97b99693613aaa74a3fa0b2f05378b8f6a74a893']
    },
    {
      prizePool: '0x95bca36b53ab0c54b162672454fe4be869a6f9ca',
      symbol: 'USDC-0x95bca3',
      subgraphVersion: '3.3.2'
    },
    {
      prizePool: '0xc8e1ea1afb7361cd647ad1a54a6c074f1174eb6e',
      symbol: 'BAT-0xc8e1ea',
      subgraphVersion: '3.3.2'
    },
    {
      prizePool: '0x84ed0f89c033fe7dadfc4d5f2a516ebd9dc15644',
      symbol: 'DAI-0x84ed0f',
      subgraphVersion: '3.3.8'
    },
    {
      prizePool: '0xe19b8887677432707ae4dd1ce6b50ef9abd44bb6',
      symbol: 'USDC-0xe19b88',
      subgraphVersion: '3.3.8'
    },
    {
      prizePool: '0x7355f97fBA5237aEdFE2CdAad50A4eA3cF070A98',
      symbol: 'FAST-DAI-0x7355f9',
      subgraphVersion: '3.3.8'
    },
    {
      prizePool: '0x8A358f613ddCca865D005414c1690920E4e9b132',
      symbol: 'LP',
      subgraphVersion: '',
      tokenFaucets: ['0x97B99693613aaA74A3fa0B2f05378b8F6A74a893']
    }
  ],
  [CHAIN_ID.bsc]: [
    {
      prizePool: '0x06D75Eb5cA4Da7F7C7A043714172CF109D07a5F8',
      symbol: 'CAKE-0x06D75E',
      subgraphVersion: '3.4.3'
    },
    {
      prizePool: '0x2f4Fc07E4Bd097C68774E5bdAbA98d948219F827',
      symbol: 'WBNB-0x2f4Fc0',
      subgraphVersion: '3.4.3'
    }
  ],
  [CHAIN_ID.polygon]: [
    {
      prizePool: '0x887e17d791dcb44bfdda3023d26f7a04ca9c7ef4',
      symbol: 'USDT-0x887E17',
      subgraphVersion: '3.3.8',
      tokenFaucets: [
        '0x90a8d8ee6fdb1875028c6537877e6704b2646c51',
        '0x951A969324127Fcc19D3498d6954A296E3B9C33c',
        '0x12533c9fe479ab8c27e55c1b7697e0647fadb153'
      ]
    },
    {
      prizePool: '0xee06abe9e2af61cabcb13170e01266af2defa946',
      symbol: 'USDC-0xee06ab',
      subgraphVersion: '3.4.3',
      tokenFaucets: ['0x6cbc003fe015d753180f072d904ba841b2415498']
    },
    {
      prizePool: '0x2aC049f07d56Ed04F84Ff80022A71a1A2d8cE19b',
      symbol: 'POOL-0x2aC049',
      subgraphVersion: ''
    }
  ],
  [CHAIN_ID.celo]: [
    {
      prizePool: '0x6F634F531ED0043B94527F68EC7861B4B1Ab110d',
      symbol: 'CELO-cUSD',
      subgraphVersion: '3.4.5',
      tokenFaucets: ['0xc777e1db58c386b8827bc1321fc2fef03ee5a7b7']
    },
    {
      prizePool: '0xbe55435BdA8f0A2A20D2Ce98cC21B0AF5bfB7c83',
      symbol: 'CELO-cEUR',
      subgraphVersion: '3.4.5',
      tokenFaucets: ['0xd7bb81038d60e3530b9d550cd17de605bd27b937']
    }
  ]
}

export const POD_ADDRESSES = Object.freeze({
  [CHAIN_ID.mainnet]: [
    {
      // DAI Pod
      pod: '0x2f994e2E4F3395649eeE8A89092e63Ca526dA829',
      prizePool: '0xEBfb47A7ad0FD6e57323C8A42B2E5A6a4F68fc1a'
    },
    {
      // USDC Pod
      pod: '0x386EB78f2eE79AddE8Bdb0a0e27292755ebFea58',
      prizePool: '0xde9ec95d7708B8319CCca4b8BC92c0a3B70bf416'
    }
  ],
  [CHAIN_ID.rinkeby]: [
    {
      // DAI Pod
      pod: '0x4A26b34A902045CFb573aCb681550ba30AA79783',
      prizePool: '0x4706856FA8Bb747D50b4EF8547FE51Ab5Edc4Ac2'
    }
  ]
})

export enum DEXES {
  UniSwap = 'UniSwap',
  SushiSwap = 'SushiSwap'
}

export const LP_PRIZE_POOL_METADATA = Object.freeze({
  [CHAIN_ID.mainnet]: [
    {
      prizePool: '0x3af7072d29adde20fc7e173a7cb9e45307d2fb0a',
      tokens: {
        ticket: {
          address: '0xeb8928ee92efb06c44d072a24c2bcb993b61e543',
          name: 'PT UNI-V2 LP Ticket',
          symbol: 'PTUNI POOL-ETH'
        },
        underlyingToken: {
          address: '0x85cb0bab616fe88a89a35080516a8928f38b518b',
          dex: DEXES.UniSwap,
          name: 'Uniswap POOL/ETH LP',
          pair: 'POOL/ETH',
          symbol: 'UNI-V2 LP',
          token1: {
            symbol: 'POOL',
            address: '0x0cEC1A9154Ff802e7934Fc916Ed7Ca50bDE6844e'
          },
          token2: {
            symbol: 'ETH',
            address: '0xc02aaa39b223fe8d0a0e5c4f27ead9083c756cc2' // WETH
          }
        },
        tokenFaucetDripToken: {
          address: '0x0cEC1A9154Ff802e7934Fc916Ed7Ca50bDE6844e',
          symbol: 'POOL'
        }
      },
      tokenFaucets: ['0x9a29401ef1856b669f55ae5b24505b3b6faeb370']
    }
  ],
  [CHAIN_ID.rinkeby]: [
    {
      prizePool: '0x8A358f613ddCca865D005414c1690920E4e9b132',
      tokens: {
        ticket: {
          address: '0x9b8c6fd165e0bffb93e6f2cf564d2cc7271e120f',
          name: 'PT UNI-V2 LP Ticket',
          symbol: 'PTUNI POOL-ETH'
        },
        underlyingToken: {
          address: '0x91A590A2D78c71775318524c198a0f2000112108',
          dex: DEXES.UniSwap,
          name: 'Uniswap POOL/ETH LP Rinkeby',
          pair: 'POOL/ETH',
          symbol: 'UNI-V2 LP',
          token1: {
            symbol: 'POOL',
            address: '0xc4E90a8Dc6CaAb329f08ED3C8abc6b197Cf0F40A'
          },
          token2: {
            symbol: 'ETH',
            address: '0xc778417e063141139fce010982780140aa0cd5ab'
          }
        },
        tokenFaucetDripToken: {
          address: '0xc4E90a8Dc6CaAb329f08ED3C8abc6b197Cf0F40A',
          symbol: 'POOL'
        }
      },
      tokenFaucets: ['0x97B99693613aaA74A3fa0B2f05378b8F6A74a893']
    }
  ]
})

export const POOL_PRIZE_POOL_ADDRESSES = Object.freeze({
  [CHAIN_ID.mainnet]: ['0x396b4489da692788e327e2e4b2b0459a5ef26791'],
  [CHAIN_ID.polygon]: ['0x2aC049f07d56Ed04F84Ff80022A71a1A2d8cE19b'], // Don't show staking for Polygon pool
  [CHAIN_ID.rinkeby]: ['0x4706856fa8bb747d50b4ef8547fe51ab5edc4ac2']
})

export const POOL_ADDRESSES = Object.freeze({
  [CHAIN_ID.mainnet]: {
    pool: '0x0cEC1A9154Ff802e7934Fc916Ed7Ca50bDE6844e'
  },
  [CHAIN_ID.rinkeby]: {
    pool: '0xc4E90a8Dc6CaAb329f08ED3C8abc6b197Cf0F40A'
  },
  [CHAIN_ID.polygon]: {
    polygon_bridge: '0x25788a1a171ec66Da6502f9975a15B609fF54CF6'
  }
})
