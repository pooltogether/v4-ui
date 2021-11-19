const defaultNetworkName = 'mainnet'

const APP_NAME = 'PoolTogether'

const INFURA_ID = process.env.NEXT_JS_INFURA_ID

const RPC_URL =
  defaultNetworkName && INFURA_ID
    ? `https://${defaultNetworkName}.infura.io/v3/${INFURA_ID}`
    : 'http://localhost:8545'

const walletConnectOptions = {
  infuraKey: INFURA_ID,
  preferred: true,
  rpc: {
    42220: 'https://forno.celo.org',
    44787: 'https://alfajores-forno.celo-testnet.org',
    62320: 'https://baklava-forno.celo-testnet.org',
    1: RPC_URL,
    137: 'https://polygon-rpc.com'
  },
  bridge: 'https://pooltogether.bridge.walletconnect.org/'
}

export const CUSTOM_WALLETS_CONFIG = [
  { walletName: 'metamask', preferred: true },
  {
    walletName: 'walletConnect',
    ...walletConnectOptions
  },
  { walletName: 'coinbase', preferred: true },
  {
    walletName: 'walletLink',
    preferred: true,
    rpcUrl: RPC_URL
  },
  {
    walletName: 'trezor',
    preferred: true,
    appUrl: 'https://v4.pooltogether.com',
    email: 'hello@pooltogether.com',
    rpcUrl: RPC_URL
  },
  {
    walletName: 'ledger',
    preferred: true,
    rpcUrl: RPC_URL
  },
  {
    walletName: 'lattice',
    preferred: true,
    rpcUrl: RPC_URL,
    appName: APP_NAME
  },
  {
    walletName: 'web3Wallet',
    preferred: true
  }
]
