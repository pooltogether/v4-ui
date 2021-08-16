import { APP_ENVIRONMENT, useAppEnv } from '@pooltogether/hooks'
import { NETWORK } from '@pooltogether/utilities'
import { usePoolChainId } from 'lib/hooks/usePoolChainId'

const MOCK_POOLS = Object.freeze({
  [NETWORK.mainnet]: {
    config: { chainId: NETWORK.rinkeby },
    prizePool: { address: '0x4706856fa8bb747d50b4ef8547fe51ab5edc4ac2' },
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
  },
  [NETWORK.rinkeby]: {
    config: { chainId: NETWORK.rinkeby },
    prizePool: { address: '0x4706856fa8bb747d50b4ef8547fe51ab5edc4ac2' },
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
