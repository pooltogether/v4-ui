import { CHAIN_ID } from '@pooltogether/wallet-connection'

export const SECONDS_PER_BLOCK = 13

export const SECONDS_PER_WEEK = 604800
export const SECONDS_PER_DAY = 86400
export const SECONDS_PER_HOUR = 3600

export const MAX_SAFE_INTEGER = 9007199254740991

// cookie names
export const TRANSACTIONS_KEY = 'txs'
export const SHOW_MANAGE_LINKS = 'showManageLinks'
export const MAGIC_EMAIL = 'magicEmail'
export const SELECTED_WALLET_COOKIE_KEY = 'selectedWallet'

const domain = process.env.NEXT_PUBLIC_DOMAIN_NAME && `.${process.env.NEXT_PUBLIC_DOMAIN_NAME}`
export const COOKIE_OPTIONS = {
  sameSite: 'strict',
  secure: process.env.NEXT_PUBLIC_DOMAIN_NAME === 'pooltogether.com',
  domain
}

export const POOLPOOL_SNAPSHOT_URL = 'https://snapshot.org/#/poolpool.pooltogether.eth'
export const POOLTOGETHER_SNAPSHOT_URL = 'https://snapshot.org/#/pooltogether.eth'
export const POOLTOGETHER_GOV_FORUM_URL = 'https://gov.pooltogether.com'
export const DISCORD_INVITE_URL = 'https://pooltogether.com/discord'

export const POOL_TOKEN = Object.freeze({
  [CHAIN_ID.mainnet]: '0x0cec1a9154ff802e7934fc916ed7ca50bde6844e',
  [CHAIN_ID.polygon]: '0x25788a1a171ec66da6502f9975a15b609ff54cf6',
  [CHAIN_ID.optimism]: '0x395ae52bb17aef68c2888d941736a71dc6d4e125'
})

export const PPOOL_TICKET_TOKEN = Object.freeze({
  [CHAIN_ID.mainnet]: '0x27d22a7648e955e510a40bdb058333e9190d12d4',
  [CHAIN_ID.polygon]: '0xd80eaa761ccfdc8698999d73c96cec39fbb1fc48'
})

export const WETH_TOKEN = Object.freeze({
  [CHAIN_ID.mainnet]: '0xc02aaa39b223fe8d0a0e5c4f27ead9083c756cc2'
})
