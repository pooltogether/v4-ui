import { TokenInfo } from "@uniswap/widgets";
import { CHAIN_ID } from "./misc";

const tokenList: TokenInfo[] = [
  // POOL
  {
    address: '0x0cEC1A9154Ff802e7934Fc916Ed7Ca50bDE6844e',
    chainId: CHAIN_ID.mainnet,
    decimals: 18,
    name: 'PoolTogether',
    symbol: 'POOL',
    logoURI: 'ipfs://QmPqZ8pVyBCdw2N365t47yJ6n6beZ5X2ZxE5d1zMo4Gh2U'
  },
  {
    address: '0x25788a1a171ec66da6502f9975a15b609ff54cf6',
    chainId: CHAIN_ID.polygon,
    decimals: 18,
    name: 'PoolTogether',
    symbol: 'POOL',
    logoURI: 'ipfs://QmPqZ8pVyBCdw2N365t47yJ6n6beZ5X2ZxE5d1zMo4Gh2U'
  },
  {
    address: '0xc4E90a8Dc6CaAb329f08ED3C8abc6b197Cf0F40A',
    chainId: CHAIN_ID.rinkeby,
    decimals: 18,
    name: 'PoolTogether',
    symbol: 'POOL',
    logoURI: 'ipfs://QmPqZ8pVyBCdw2N365t47yJ6n6beZ5X2ZxE5d1zMo4Gh2U'
  },

  // USDC
  {
    name: 'USDCoin',
    address: '0xA0b86991c6218b36c1d19D4a2e9Eb0cE3606eB48',
    symbol: 'USDC',
    decimals: 6,
    chainId: CHAIN_ID.mainnet,
    logoURI:
      'https://raw.githubusercontent.com/uniswap/assets/master/blockchains/ethereum/assets/0xA0b86991c6218b36c1d19D4a2e9Eb0cE3606eB48/logo.png'
  },
  {
    name: 'USDCoin',
    address: '0xe6b8a5CF854791412c1f6EFC7CAf629f5Df1c747',
    symbol: 'USDC',
    decimals: 6,
    chainId: CHAIN_ID.mumbai,
    logoURI:
      'https://raw.githubusercontent.com/uniswap/assets/master/blockchains/ethereum/assets/0xA0b86991c6218b36c1d19D4a2e9Eb0cE3606eB48/logo.png'
  },
  {
    name: 'USDCoin',
    address: '0x2791Bca1f2de4661ED88A30C99A7a9449Aa84174',
    symbol: 'USDC',
    decimals: 6,
    chainId: CHAIN_ID.polygon,
    logoURI:
      'https://raw.githubusercontent.com/uniswap/assets/master/blockchains/ethereum/assets/0xA0b86991c6218b36c1d19D4a2e9Eb0cE3606eB48/logo.png'
  },
  {
    name: 'USDCoin',
    address: '0xeb8f08a975Ab53E34D8a0330E0D34de942C95926',
    symbol: 'USDC',
    decimals: 6,
    chainId: CHAIN_ID.rinkeby,
    logoURI:
      'https://raw.githubusercontent.com/uniswap/assets/master/blockchains/ethereum/assets/0xA0b86991c6218b36c1d19D4a2e9Eb0cE3606eB48/logo.png'
  },

  // WETH
  {
    name: 'Wrapped Ether',
    address: '0xC02aaA39b223FE8D0A0e5C4F27eAD9083C756Cc2',
    symbol: 'WETH',
    decimals: 18,
    chainId: CHAIN_ID.mainnet,
    logoURI:
      'https://raw.githubusercontent.com/uniswap/assets/master/blockchains/ethereum/assets/0xC02aaA39b223FE8D0A0e5C4F27eAD9083C756Cc2/logo.png'
  },
  {
    name: 'Wrapped Ether',
    address: '0x7ceB23fD6bC0adD59E62ac25578270cFf1b9f619',
    symbol: 'WETH',
    decimals: 18,
    chainId: CHAIN_ID.polygon,
    logoURI:
      'https://raw.githubusercontent.com/uniswap/assets/master/blockchains/ethereum/assets/0xC02aaA39b223FE8D0A0e5C4F27eAD9083C756Cc2/logo.png'
  },
  {
    name: 'Wrapped Ether',
    address: '0xc778417E063141139Fce010982780140Aa0cD5Ab',
    symbol: 'WETH',
    decimals: 18,
    chainId: CHAIN_ID.rinkeby,
    logoURI:
      'https://raw.githubusercontent.com/uniswap/assets/master/blockchains/ethereum/assets/0xC02aaA39b223FE8D0A0e5C4F27eAD9083C756Cc2/logo.png'
  },

  // MATIC on Ethereum
  {
    address: '0x7d1afa7b718fb893db30a3abc0cfc608aacfebb0',
    chainId: CHAIN_ID.mainnet,
    decimals: 18,
    name: 'Matic',
    symbol: 'MATIC',
    logoURI: 'https://raw.githubusercontent.com/Uniswap/assets/master/blockchains/polygon/assets/0x0d500B1d8E8eF31E21C99d1Db9A6444d3ADf1270/logo.png'
  },

  // WMATIC
  {
    address: '0x0d500B1d8E8eF31E21C99d1Db9A6444d3ADf1270',
    chainId: CHAIN_ID.polygon,
    decimals: 18,
    name: 'Wrapped Matic',
    symbol: 'WMATIC',
    logoURI: 'https://raw.githubusercontent.com/Uniswap/assets/master/blockchains/polygon/assets/0x0d500B1d8E8eF31E21C99d1Db9A6444d3ADf1270/logo.png'
  },
  {
    address: '0x9c3C9283D3e44854697Cd22D3Faa240Cfb032889',
    chainId: CHAIN_ID.mumbai,
    decimals: 18,
    name: 'Wrapped Matic',
    symbol: 'WMATIC',
    logoURI: 'https://raw.githubusercontent.com/Uniswap/assets/master/blockchains/polygon/assets/0x0d500B1d8E8eF31E21C99d1Db9A6444d3ADf1270/logo.png'
  }
]

export default tokenList