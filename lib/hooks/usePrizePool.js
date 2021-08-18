import { APP_ENVIRONMENT, useAppEnv } from '@pooltogether/hooks'
import { NETWORK } from '@pooltogether/utilities'
import { usePoolChainId } from 'lib/hooks/usePoolChainId'

const MOCK_POOLS = Object.freeze({
  [NETWORK.mainnet]: {
    config: { chainId: NETWORK.mainnet },
    prizePool: { address: '0xde9ec95d7708B8319CCca4b8BC92c0a3B70bf416' },
    prizeStrategy: { address: '0x3D9946190907aDa8b70381b25c71eB9adf5f9B7b' },
    tokens: {
      ticket: {
        decimals: 6,
        address: '0xD81b1A8B1AD00Baa2D6609E0BAE28A38713872f7'
      },
      underlyingToken: {
        decimals: 6,
        address: '0xA0b86991c6218b36c1d19D4a2e9Eb0cE3606eB48'
      }
    }
  },
  [NETWORK.rinkeby]: {
    config: { chainId: NETWORK.rinkeby },
    prizePool: { address: '0x4706856fa8bb747d50b4ef8547fe51ab5edc4ac2' },
    prizeStrategy: { address: '0x5E0A6d336667EACE5D1b33279B50055604c3E329' },
    tokens: {
      ticket: {
        decimals: 18,
        address: '0x4fb19557fbd8d73ac884efbe291626fd5641c778'
      },
      underlyingToken: {
        decimals: 18,
        address: '0x5592ec0cfb4dbc12d3ab100b257153436a1f0fea'
      }
    }
  }
})

export const usePrizePool = () => {
  const chainId = usePoolChainId()
  return MOCK_POOLS[chainId]
}
