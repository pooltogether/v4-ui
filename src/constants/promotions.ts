import { CHAIN_ID } from '@constants/misc'
import { APP_ENVIRONMENTS } from '@pooltogether/hooks'

export const FILTERED_PROMOTION_IDS = {
  [CHAIN_ID['optimism-goerli']]: [],
  [CHAIN_ID.mumbai]: [],
  [CHAIN_ID.goerli]: [],
  [CHAIN_ID.fuji]: [],
  [CHAIN_ID.optimism]: [5],
  [CHAIN_ID.polygon]: [],
  [CHAIN_ID.mainnet]: [],
  [CHAIN_ID.avalanche]: []
}

export const TWAB_REWARDS_DEFAULT_CHAIN_ID = Object.freeze({
  [APP_ENVIRONMENTS.mainnets]: CHAIN_ID.polygon,
  [APP_ENVIRONMENTS.testnets]: CHAIN_ID.goerli
})

export const TWAB_REWARDS_SUPPORTED_CHAIN_IDS = Object.freeze({
  [APP_ENVIRONMENTS.mainnets]: [
    CHAIN_ID.optimism,
    CHAIN_ID.polygon,
    CHAIN_ID.mainnet,
    CHAIN_ID.avalanche
  ],
  [APP_ENVIRONMENTS.testnets]: [
    CHAIN_ID['optimism-goerli'],
    CHAIN_ID.mumbai,
    CHAIN_ID.goerli,
    CHAIN_ID.fuji
  ]
})

export const TWAB_REWARDS_ADDRESS: { [chainId: number]: string } = Object.freeze({
  [CHAIN_ID.optimism]: '0x1470c87e2db5247A36C60DE3D65D7C972C62EA0f',
  [CHAIN_ID.polygon]: '0x1470c87e2db5247A36C60DE3D65D7C972C62EA0f',
  [CHAIN_ID.mainnet]: '0xe7934EE0c8b877269A5688ee26dd853785212618',
  [CHAIN_ID.avalanche]: '0x01A1F0699356afeB850f5A80226C35A9319CAf74',
  [CHAIN_ID['optimism-goerli']]: '0xb38e46EBf90888D621Cde5661D3cC2476d7bCc2e',
  [CHAIN_ID.goerli]: '0x71B44a2EB4A59d0Da32aFa82b4732719C046CB84',
  [CHAIN_ID.mumbai]: '0x9Bd20CD20C30F463f191a81ad370304f8B9D23E0',
  [CHAIN_ID.fuji]: '0x94827AF5F6E981F4C67507dCDdAB541c78655d6B'
})
