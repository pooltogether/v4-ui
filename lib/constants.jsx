// const PermitAndDepositDaiMainnet = require(`@pooltogether/pooltogether-contracts/deployments/mainnet/PermitAndDepositDai.json`)
// const PermitAndDepositDaiRinkeby = require(`@pooltogether/pooltogether-contracts/deployments/rinkeby/PermitAndDepositDai.json`)
// const PermitAndDepositDaiRopsten = require(`@pooltogether/pooltogether-contracts/deployments/ropsten/PermitAndDepositDai.json`)

export const SUPPORTED_CHAIN_IDS = [1, 4, 31337, 1234]

export const SECONDS_PER_BLOCK = 14

export const DEFAULT_TOKEN_PRECISION = 18

export const COINGECKO_POLLING_INTERVAL = 120 * 1000
export const UNISWAP_POLLING_INTERVAL = process.env.NEXT_JS_DOMAIN_NAME ? (120 * 1000) : (60 * 1000)
export const ERC_721_POLLING_INTERVAL = 120 * 1000
export const MAINNET_POLLING_INTERVAL = process.env.NEXT_JS_DOMAIN_NAME ? (22 * 1000) : (16 * 1000)

export const PLAYER_PAGE_SIZE = 10

export const MAX_SAFE_INTEGER = 9007199254740991

// cookie names
export const REFERRER_ADDRESS_KEY = 'referrerAddress'
export const WIZARD_REFERRER_HREF = 'wizardReferrerHref'
export const WIZARD_REFERRER_AS_PATH = 'wizardReferrerAsPath'
export const STORED_CHAIN_ID_KEY = 'chainId'
export const TRANSACTIONS_KEY = 'txs'
export const SHOW_MANAGE_LINKS = 'showManageLinks'
export const MAGIC_EMAIL = 'magicEmail'
export const SELECTED_WALLET_COOKIE_KEY = 'selectedWallet'

// strings
export const CONFETTI_DURATION_MS = 12000

export const DEFAULT_INPUT_CLASSES = 'w-full text-inverse inline-flex items-center justify-between trans'
                                     
const domain = process.env.NEXT_JS_DOMAIN_NAME && `.${process.env.NEXT_JS_DOMAIN_NAME}`
export const COOKIE_OPTIONS = {
  sameSite: 'strict',
  secure: process.env.NEXT_JS_DOMAIN_NAME === 'pooltogether.com',
  domain
}

export const POOLS = {
  1: [
    {
      name: 'DAI Pool',
      frequency: 'Weekly',
      symbol: 'PT-cDAI'
    },
    {
      name: 'UNI Pool',
      frequency: 'Weekly',
      symbol: 'PT-cUNI'
    },
    {
      name: 'USDC Pool',
      frequency: 'Weekly',
      symbol: 'PT-cUSDC'
    }
  ],
  4: [
    {
      name: 'DAI Pool',
      frequency: 'Weekly',
      symbol: 'PT-cDAI'
    },
    {
      name: 'BAT Pool',
      frequency: 'Weekly',
      symbol: 'PT-cBAT'
    },
    {
      name: 'USDC Pool',
      frequency: 'Weekly',
      symbol: 'PT-cUSDC'
    }
  ]
}

export const PRIZE_STRATEGY_TYPES = {
  'singleRandomWinner': 'singleRandomWinner',
  'multipleWinners': 'multipleWinners'
}

export const CONTRACT_ADDRESSES = {
  1: {
    Usdt: '0xdac17f958d2ee523a2206206994597c13d831ec7',
    // Dai: '0x6b175474e89094c44da98b954eedeac495271d0f',
    // PermitAndDepositDai: PermitAndDepositDaiMainnet.address
  },
  3: {
    Usdt: '0x0736d0c130b2ead47476cc262dbed90d7c4eeabd',
    // Dai: '0xc2118d4d90b274016cb7a54c03ef52e6c537d957',
    // PermitAndDepositDai: PermitAndDepositDaiRopsten.address
  },
  4: {
    Usdt: '0x3b00ef435fa4fcff5c209a37d1f3dcff37c705ad',
    // PermitAndDepositDai: PermitAndDepositDaiRinkeby.address,
  },
}

export const TOKEN_IMAGES = {
  '0x9d942bd31169ed25a1ca78c776dab92de104e50e': '/tokens/0x9d942bd31169ed25a1ca78c776dab92de104e50e.png',
  '0x6b175474e89094c44da98b954eedeac495271d0f': '/tokens/dai-new-transparent.png',
  '0x2260fac5e5542a773aa44fbcfedf7c193bc2c599': 'https://assets.coingecko.com/coins/images/7598/thumb/wrapped_bitcoin_wbtc.png?1548822744',
  '0x06f65b8cfcb13a9fe37d836fe9708da38ecb29b2': 'https://assets.coingecko.com/coins/images/11521/thumb/FAME.png?1590622461',
  '0x1494ca1f11d487c2bbe4543e90080aeba4ba3c2b': 'https://assets.coingecko.com/coins/images/12465/thumb/defi_pulse_index_set.png',
  '0x1f9840a85d5af5bf1d1762f925bdaddc4201f984': 'https://assets.coingecko.com/coins/images/12504/thumb/uniswap-uni.png?1600306604',
  '0x2b591e99afe9f32eaa6214f7b7629768c40eeb39': 'https://assets.coingecko.com/coins/images/10103/thumb/HEX-logo.png?1575942673',
  // '0x2e703d658f8dd21709a7b458967ab4081f8d3d05': '',
  '0x429881672b9ae42b8eba0e26cd9c73711b891ca5': 'https://assets.coingecko.com/coins/images/12435/thumb/pickle_finance_logo.jpg?1599817746',
  '0x5dbcf33d8c2e976c6b560249878e6f1491bca25c': 'https://assets.coingecko.com/coins/images/12210/thumb/yUSD.png?1600166557',
  '0x6e36556b3ee5aa28def2a8ec3dae30ec2b208739': 'https://assets.coingecko.com/coins/images/12380/thumb/build.PNG?1599463828',
  '0x7865af71cf0b288b4e7f654f4f7851eb46a2b7f8': 'https://assets.coingecko.com/coins/images/7383/thumb/2x9veCp.png?1598409975',
  '0x7fc66500c84a76ad7e9c93437bfc5ac33e2ddae9': 'https://assets.coingecko.com/coins/images/12645/thumb/AAVE.png?1601374110',
  '0x8ba6dcc667d3ff64c1a2123ce72ff5f0199e5315': 'https://assets.coingecko.com/coins/images/10972/thumb/ALEX.png?1586742545',
  '0xa0246c9032bc3a600820415ae600c6388619a14d': 'https://assets.coingecko.com/coins/images/12304/thumb/Harvest.png?1599007988',
  '0xc00e94cb662c3520282e6f5717214004a7f26888': 'https://assets.coingecko.com/coins/images/10775/thumb/COMP.png?1592625425',
  '0xc011a73ee8576fb46f5e1c5751ca3b9fe0af2a6f': 'https://assets.coingecko.com/coins/images/3406/thumb/SNX.png?1598631139',
  '0xc02aaa39b223fe8d0a0e5c4f27ead9083c756cc2': 'https://assets.coingecko.com/coins/images/2518/thumb/weth.png?1547036627',
  '0xd533a949740bb3306d119cc777fa900ba034cd52': 'https://assets.coingecko.com/coins/images/12124/thumb/Curve.png?1597369484',
  '0xe2f2a5c287993345a840db3b0845fbc70f5935a5': 'https://assets.coingecko.com/coins/images/11576/thumb/mStable_USD.png?1595591803',
  '0x117c2aca45d87958ba054cb85af0fd57be00d624': '/tokens/0x117c2aca45d87958ba054cb85af0fd57be00d624.png',
  // '0x2e703d658f8dd21709a7b458967ab4081f8d3d05': '',
  '0x8b9c35c79af5319c70dd9a3e3850f368822ed64e': '/tokens/0x8b9c35c79af5319c70dd9a3e3850f368822ed64e.png',
  '0xdac17f958d2ee523a2206206994597c13d831ec7': 'https://assets.coingecko.com/coins/images/325/thumb/Tether-logo.png?1602230054',
  '0xa91ac63d040deb1b7a5e4d4134ad23eb0ba07e14': 'https://assets.coingecko.com/coins/images/12478/thumb/Bella.png?1602230054',
  '0x08d32b0da63e2c3bcf8019c9c5d849d7a9d791e6': 'https://assets.coingecko.com/coins/images/850/thumb/dentacoin.png?1547034647',
  '0x6b3595068778dd592e39a122f4f5a5cf09c90fe2': 'https://assets.coingecko.com/coins/images/12271/thumb/sushi.jpg?1598623048',
  '0x0954906da0bf32d5479e25f46056d22f08464cab': '/tokens/0x0954906da0bf32d5479e25f46056d22f08464cab.png',
  '0xd291e7a03283640fdc51b121ac401383a46cc623': 'https://assets.coingecko.com/coins/images/12900/thumb/rgt_logo.png?1603340632',
  '0x334cbb5858417aee161b53ee0d5349ccf54514cf': '/favicon.png'
}

export const TOKEN_VALUES = {
  '0x1f9840a85d5af5bf1d1762f925bdaddc4201f984': 5.6,
  '0x852358c72f0d38df475b58f90c9b24aadc63c9db': 1,
  '0x334cbb5858417aee161b53ee0d5349ccf54514cf': 1,
  '0x9d942bd31169ed25a1ca78c776dab92de104e50e': 279.31
  // '0x117c2aca45d87958ba054cb85af0fd57be00d624': 603.98,
  // '0xea0bea4d852687c45fdc57f6b06a8a92302baabc': 250.49
}

export const TOKEN_NAMES = {
  '0x334cbb5858417aee161b53ee0d5349ccf54514cf': 'PoolTogether DAI Tickets',
}

export const HISTORICAL_TOKEN_VALUES = {
  prizeNumber: {
    1: {
      '0x06f65b8cfcb13a9fe37d836fe9708da38ecb29b2': 970.23,
      '0x117c2aca45d87958ba054cb85af0fd57be00d624': 603.98,
      '0xea0bea4d852687c45fdc57f6b06a8a92302baabc': 250.49
    }
  }
}

export const V2_CONTRACT_ADDRESSES = [
  '0x29fe7D60DdF151E5b52e5FAB4f1325da6b2bD958'.toLowerCase(),
  '0x0034Ea9808E620A0EF79261c51AF20614B742B24'.toLowerCase(),
  '0x9F4C5D8d9BE360DF36E67F52aE55C1B137B4d0C4'.toLowerCase(),
  '0x6F5587E191C8b222F634C78111F97c4851663ba4'.toLowerCase(),
  '0x49d716DFe60b37379010A75329ae09428f17118d'.toLowerCase(),
  '0xBD87447F48ad729C5c4b8bcb503e1395F62e8B98'.toLowerCase(),
  '0x801b4872a635dccc7e679eeaf04bef08e562972a'.toLowerCase(),
]

export const QUERY_KEYS = {
  ethereumErc20sQuery: 'ethereumErc20sQuery',
  ethereumErc721sQuery: 'ethereumErc721sQuery',
  ethereumLootBoxQuery: 'ethereumLootBoxQuery',
  ethereumPoolQuery: 'ethereumPoolQuery',
  ethereumUsersDripQuery: 'ethereumUsersDripQuery',
  ethereumUsersV2Query: 'ethereumUsersV2Query',
  ethereumUsersChainQuery: 'ethereumUsersChainQuery',
  lootBoxQuery: 'lootBoxQuery',
  poolQuery: 'poolQuery',
  poolsQuery: 'poolsQuery',
  poolDripsQuery: 'poolDripsQuery',
  poolPrizesQuery: 'poolPrizesQuery',
  playerQuery: 'playerQuery',
  playerPrizesQuery: 'playerPrizesQuery',
  prizeQuery: 'prizeQuery',
  sponsorQuery: 'sponsorQuery',
  uniswapTokensQuery: 'uniswapTokensQuery',
  accountQuery: 'accountQuery',
  prizePoolAccountQuery: 'prizePoolAccountQuery',
  controlledTokenBalancesQuery: 'controlledTokenBalancesQuery',
}

// we may not need any of this:
export const POOLTOGETHER_LATEST_VERSION = {
  'staging': 'v3_1_0',
  'production': 'v3_1_0',
}

export const POOLTOGETHER_CONTRACT_VERSIONS = {
  ['0xebfb47a7ad0fd6e57323c8a42b2e5a6a4f68fc1a'.toLowerCase()]: 'v3_0_1', // mainnet: cDai prize pool

  ['0x4706856fa8bb747d50b4ef8547fe51ab5edc4ac2'.toLowerCase()]: 'v3_0_1', // rinkeby: cDai prize pool
  ['0xe470984fbe3c16acfc41ba2e5274c297f0723134'.toLowerCase()]: 'v3_0_1', // rinkeby: cDai prize pool single winner prize strategy
  ['0x506cfb5ed425fe986cb913522f3297a79697abfc'.toLowerCase()]: 'v3_0_1', // rinkeby: cDai prize pool single winner prize strategy
  ['0x5e0a6d336667eace5d1b33279b50055604c3e329'.toLowerCase()]: 'v3_1_0', // rinkeby: cDai prize pool multiple winners prize strategy
}

export const POOLTOGETHER_VERSION_START_BLOCKS = {
  v3_0_1: {
    staging: {
      1: 2222222,
      3: 3333333,
      4: 7399763,
    },
    production: {
      1: 22222222,
      3: 33333333,
      4: 7399763,
    }
  },
  v3_1_0: {
    staging: {
      1: 2222222,
      3: 3333333,
      4: 7687002,
    },
    production: {
      1: 22222222,
      3: 33333333,
      4: 7687002,
    }
  }
}

export const POOLTOGETHER_CURRENT_GRAPH_URIS = {
  1: process.env.NEXT_JS_SUBGRAPH_URI_MAINNET,
  3: process.env.NEXT_JS_SUBGRAPH_URI_ROPSTEN,
  4: process.env.NEXT_JS_SUBGRAPH_URI_RINKEBY
}

export const POOLTOGETHER_GRAPH_URIS = {
  v3_0_1: {
    production: {
      1: process.env.NEXT_JS_SUBGRAPH_3_0_1_URI_MAINNET,
      3: process.env.NEXT_JS_SUBGRAPH_3_0_1_URI_ROPSTEN,
      4: process.env.NEXT_JS_SUBGRAPH_3_0_1_URI_RINKEBY,
    },
    staging: {
      1: process.env.NEXT_JS_SUBGRAPH_3_0_1_STAGING_URI_MAINNET,
      3: process.env.NEXT_JS_SUBGRAPH_3_0_1_STAGING_URI_ROPSTEN,
      4: process.env.NEXT_JS_SUBGRAPH_3_0_1_STAGING_URI_RINKEBY,
    },
  },
  v3_1_0: {
    production: {
      1: process.env.NEXT_JS_SUBGRAPH_3_1_0_URI_MAINNET,
      3: process.env.NEXT_JS_SUBGRAPH_3_1_0_URI_ROPSTEN,
      4: process.env.NEXT_JS_SUBGRAPH_3_1_0_URI_RINKEBY,
    },
    staging: {
      1: process.env.NEXT_JS_SUBGRAPH_3_1_0_STAGING_URI_MAINNET,
      3: process.env.NEXT_JS_SUBGRAPH_3_1_0_STAGING_URI_ROPSTEN,
      4: process.env.NEXT_JS_SUBGRAPH_3_1_0_STAGING_URI_RINKEBY,
    },
  }
}

export const LOOTBOX_GRAPH_URIS = {
  1: process.env.NEXT_JS_SUBGRAPH_LOOTBOX_URI_MAINNET,
  3: process.env.NEXT_JS_SUBGRAPH_LOOTBOX_URI_ROPSTEN,
  4: process.env.NEXT_JS_SUBGRAPH_LOOTBOX_URI_RINKEBY,
}

export const UNISWAP_GRAPH_URIS = {
  1: process.env.NEXT_JS_UNISWAP_SUBGRAPH_URI_MAINNET, // https://api.thegraph.com/subgraphs/name/uniswap/uniswap-v2
  3: process.env.NEXT_JS_UNISWAP_SUBGRAPH_URI_ROPSTEN,
  4: process.env.NEXT_JS_UNISWAP_SUBGRAPH_URI_RINKEBY, // https://api.thegraph.com/subgraphs/name/blockrockettech/uniswap-v2-subgraph-rinkeby
}

export const STRINGS = {
  transfer: 'transfer',
  withdraw: 'withdraw',
}
