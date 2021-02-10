// export const SUPPORTED_CHAIN_IDS = [1, 4, 31337, 1234]
export const SUPPORTED_CHAIN_IDS = [4, 31337, 1234]

export const SECONDS_PER_BLOCK = 13

export const DEFAULT_TOKEN_PRECISION = 18

export const MAINNET_POLLING_INTERVAL = process.env.NEXT_JS_DOMAIN_NAME ? 22 * 1000 : 16 * 1000

export const MAX_SAFE_INTEGER = 9007199254740991

// cookie names
export const TRANSACTIONS_KEY = 'txs'
export const SHOW_MANAGE_LINKS = 'showManageLinks'
export const MAGIC_EMAIL = 'magicEmail'
export const SELECTED_WALLET_COOKIE_KEY = 'selectedWallet'

// strings
export const CONFETTI_DURATION_MS = 12000

export const DEFAULT_INPUT_CLASSES =
  'w-full text-inverse inline-flex items-center justify-between trans'

const domain = process.env.NEXT_JS_DOMAIN_NAME && `.${process.env.NEXT_JS_DOMAIN_NAME}`
export const COOKIE_OPTIONS = {
  sameSite: 'strict',
  secure: process.env.NEXT_JS_DOMAIN_NAME === 'pooltogether.com',
  domain
}

export const CONTRACT_ADDRESSES = {
  1: {
    GovernorAlpha: '0x5e4be8Bc9637f0EAA1A755019e06A68ce081D58F', // TODO: This is uniswap governance. Change with ours.
    GovernanceToken: '0x1f9840a85d5aF5bf1D1762F925BDADdC4201F984' // TODO: This is UNI swap with POOL. Change with ours.
  },
  3: {},
  4: {
    GovernorAlpha: '0x2f8bef449f3b7f1083E0173317bc26FA417C8Ae8',
    GovernanceToken: '0xEae2De7Ba52298a535C59D37BAe409cCeCaDE234'
  }
}

export const QUERY_KEYS = {
  accountGovernanceDataQuery: 'accountGovernanceDataQuery',
  governorAlphaDataQuery: 'governorAlphaDataQuery',
  proposalVotesQuery: 'proposalVotesQuery',
  delegateDataQuery: 'delegateDataQuery',
  delegatesQuery: 'delegatesQuery',
  tokenHolderQuery: 'tokenHolderQuery',
  twitterProfileQuery: 'twitterProfileQuery',
  voteDataQuery: 'voteDataQuery',
  proposalsQuery: 'proposalsQuery',
  tokenFaucetAddresses: 'tokenFaucetAddresses',
  usePools: 'usePools'
}

export const POOLTOGETHER_CURRENT_GOVERNANCE_GRAPH_URIS = {
  1: process.env.NEXT_JS_GOVERNANCE_SUBGRAPH_URI_MAINNET,
  4: process.env.NEXT_JS_GOVERNANCE_SUBGRAPH_URI_RINKEBY
}

export const POOLTOGETHER_SUBGRAPH_URIS = {
  1: process.env.NEXT_JS_SUBGRAPH_URI_MAINNET,
  4: process.env.NEXT_JS_SUBGRAPH_URI_RINKEBY
}

export const PROPOSAL_STATUS = {
  pending: 'pending',
  active: 'active',
  cancelled: 'cancelled',
  defeated: 'defeated',
  succeeded: 'succeeded',
  queued: 'queued',
  expired: 'expired',
  executed: 'executed'
}

// Note: Order matches contracts
export const PROPOSAL_STATES = [
  PROPOSAL_STATUS.pending,
  PROPOSAL_STATUS.active,
  PROPOSAL_STATUS.cancelled,
  PROPOSAL_STATUS.defeated,
  PROPOSAL_STATUS.succeeded,
  PROPOSAL_STATUS.queued,
  PROPOSAL_STATUS.expired,
  PROPOSAL_STATUS.executed
]

export const VOTERS_PER_PAGE = 5
export const DELEGATES_PER_PAGE = 15
