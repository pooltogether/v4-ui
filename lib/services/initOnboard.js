import Onboard from '@pooltogether/bnc-onboard'

import { networkNameToChainId } from 'lib/utils/networkNameToChainId'

const debug = require('debug')('pool-app:initOnboard')

const INFURA_KEY = process.env.NEXT_JS_INFURA_KEY
const FORTMATIC_KEY = process.env.NEXT_JS_FORTMATIC_API_KEY
const PORTIS_KEY = process.env.NEXT_JS_PORTIS_API_KEY

const networkName = process.env.NEXT_JS_DEFAULT_ETHEREUM_NETWORK_NAME
const networkId = networkNameToChainId(networkName)
const RPC_URL = (networkName && INFURA_KEY) ?
  `https://${networkName}.infura.io/v3/${INFURA_KEY}` :
  'http://localhost:8545'

let cookieOptions = { sameSite: 'strict' }
if (process.env.NEXT_JS_DOMAIN_NAME) {
  cookieOptions = {
    ...cookieOptions,
    domain: `.${process.env.NEXT_JS_DOMAIN_NAME}`
  }
}

const APP_NAME = 'PoolTogether'

const WALLETS_CONFIG = [
  { walletName: 'metamask', preferred: true },
  { walletName: 'coinbase', preferred: true },
  { walletName: 'trust', preferred: true, rpcUrl: RPC_URL },
  {
    walletName: 'trezor',
    appUrl: 'https://app.pooltogether.com',
    email: 'hello@pooltogether.com',
    rpcUrl: RPC_URL,
    preferred: true
  },
  {
    walletName: 'ledger',
    rpcUrl: RPC_URL,
    preferred: true
  },
  {
    walletName: 'fortmatic',
    apiKey: FORTMATIC_KEY,
    preferred: true
  },
  {
    walletName: 'walletConnect',
    infuraKey: INFURA_KEY,
    preferred: true
  },
  {
    walletName: 'walletLink',
    rpcUrl: RPC_URL,
    preferred: true
  },
  {
    walletName: 'imToken',
    rpcUrl: RPC_URL,
    preferred: true
  },
  { walletName: 'dcent' },
  {
    walletName: 'huobiwallet',
    rpcUrl: RPC_URL
  },
  {
    walletName: 'portis',
    apiKey: PORTIS_KEY,
  },
  { walletName: 'authereum' },
  { walletName: 'dapper' },
  { walletName: 'status' },
  { walletName: 'torus' },
  {
    walletName: 'lattice',
    rpcUrl: RPC_URL,
    appName: APP_NAME
  },
  { walletName: 'mykey', rpcUrl: RPC_URL },
  { walletName: 'opera' },
  { walletName: 'operaTouch' },
  { walletName: 'web3Wallet' },
]

export const initOnboard = (subscriptions) => {
  const onboard = Onboard

  debug('RUNNING initOnboard!')

  return onboard({
    hideBranding: true,
    networkId,
    darkMode: true,
    subscriptions,
    walletSelect: {
      wallets: WALLETS_CONFIG
    },
    walletCheck: [
      { checkName: 'derivationPath' },
      { checkName: 'connect' },
      { checkName: 'accounts' },
      { checkName: 'network' },
      // { checkName: 'balance' }
    ]
  })
}