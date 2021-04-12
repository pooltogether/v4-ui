import Onboard from '@pooltogether/bnc-onboard'

import { networkNameToChainId } from 'lib/utils/networkNameToChainId'

const debug = require('debug')('pool-app:initOnboard')

const INFURA_ID = process.env.NEXT_JS_INFURA_ID
const FORTMATIC_KEY = process.env.NEXT_JS_FORTMATIC_API_KEY
const PORTIS_KEY = process.env.NEXT_JS_PORTIS_API_KEY

const networkName = process.env.NEXT_JS_DEFAULT_ETHEREUM_NETWORK_NAME
const networkId = networkNameToChainId(networkName)
const RPC_URL =
  networkName && INFURA_ID
    ? `https://${networkName}.infura.io/v3/${INFURA_ID}`
    : 'http://localhost:8545'

let cookieOptions = { sameSite: 'strict' }
if (process.env.NEXT_JS_DOMAIN_NAME) {
  cookieOptions = {
    ...cookieOptions,
    domain: `.${process.env.NEXT_JS_DOMAIN_NAME}`
  }
}

const APP_NAME = 'PoolTogether Governance'

const walletConnectOptions = {
  infuraKey: INFURA_ID,
  preferred: true,
  bridge: 'https://pooltogether.bridge.walletconnect.org/'
}

const WALLETS_CONFIG = [
  { walletName: 'metamask', preferred: true },
  {
    walletName: 'walletConnect',
    ...walletConnectOptions
  },
  { walletName: 'rainbow', preferred: true, ...walletConnectOptions },
  { walletName: 'argent', preferred: true, ...walletConnectOptions },
  { walletName: 'trustWallet', preferred: true, ...walletConnectOptions },
  { walletName: 'gnosisSafe', preferred: true, ...walletConnectOptions },
  { walletName: 'trust', preferred: true, rpcUrl: RPC_URL },
  { walletName: 'coinbase', preferred: true },
  {
    walletName: 'walletLink',
    preferred: true,
    rpcUrl: RPC_URL
  },
  {
    walletName: 'trezor',
    preferred: true,
    appUrl: 'https://app.pooltogether.com',
    email: 'hello@pooltogether.com',
    rpcUrl: RPC_URL
  },
  {
    walletName: 'ledger',
    preferred: true,
    rpcUrl: RPC_URL
  },
  {
    walletName: 'fortmatic',
    preferred: true,
    apiKey: FORTMATIC_KEY
  },
  {
    walletName: 'imToken',
    preferred: true,
    rpcUrl: RPC_URL
  },
  {
    walletName: 'dcent',
    preferred: true
  },
  {
    walletName: 'huobiwallet',
    preferred: true,
    rpcUrl: RPC_URL
  },
  {
    walletName: 'portis',
    preferred: true,
    apiKey: PORTIS_KEY
  },
  {
    walletName: 'authereum',
    preferred: true
  },
  {
    walletName: 'status',
    preferred: true
  },
  {
    walletName: 'torus',
    preferred: true
  },
  {
    walletName: 'lattice',
    preferred: true,
    rpcUrl: RPC_URL,
    appName: APP_NAME
  },
  {
    walletName: 'mykey',
    preferred: true,
    rpcUrl: RPC_URL
  },
  {
    walletName: 'opera',
    preferred: true
  },
  {
    walletName: 'operaTouch',
    preferred: true
  },
  {
    walletName: 'web3Wallet',
    preferred: true
  }
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
      { checkName: 'network' }
      // { checkName: 'balance' }
    ]
  })
}
