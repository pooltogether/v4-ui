import { APP_ENVIRONMENTS } from '@pooltogether/hooks'
import { CHAIN_ID } from 'lib/constants/constants'

export const PRIZE_POOLS = Object.freeze({
  [APP_ENVIRONMENTS.mainnets]: {
    [CHAIN_ID.mainnet]: '0xd89a09084555a7D0ABe7B111b1f78DFEdDd638Be',
    [CHAIN_ID.polygon]: '0x19DE635fb3678D8B8154E37d8C9Cdf182Fe84E60'
  },
  [APP_ENVIRONMENTS.testnets]: {
    [CHAIN_ID.rinkeby]: '0x996b69422d473a9B48e4A6C980328365B45847Ca',
    [CHAIN_ID.mumbai]: '0xF5165834Fc6ecbBFe6c4317673D6eF2C2d905BcB'
  }
})
