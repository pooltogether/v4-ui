import { CHAIN_ID } from '@constants/misc'
import { Token } from '@pooltogether/hooks'
import { PrizePool } from '@pooltogether/v4-client-js'
import { useQuery, UseQueryOptions } from 'react-query'

export interface PrizePoolTokens {
  prizePoolId: string
  token: Token
  ticket: Token
}

export const PRIZE_POOL_TOKENS_QUERY_KEY = 'prizePoolTokens'

export const usePrizePoolTokens = (prizePool: PrizePool) => {
  return useQuery(
    [PRIZE_POOL_TOKENS_QUERY_KEY, prizePool?.id()],
    async () => getPrizePoolTokens(prizePool),
    { initialData: PRIZE_POOL_TOKENS[prizePool?.id()] }
  )
}

export const getPrizePoolTokens = async (prizePool: PrizePool) => {
  const cachedData = PRIZE_POOL_TOKENS[prizePool.chainId]?.find(
    (data) => data.prizePoolId === prizePool.id()
  )
  if (!!cachedData) return cachedData

  const ticketDataPromise = prizePool.getTicketData()
  const tokenDataPromise = prizePool.getTokenData()

  const [ticketData, tokenData] = await Promise.all([ticketDataPromise, tokenDataPromise])

  const ticketContract = await prizePool.getTicketContract()
  const tokenContract = await prizePool.getTokenContract()

  const ticket: Token = {
    address: ticketContract.address,
    symbol: ticketData.symbol,
    name: ticketData.name,
    decimals: ticketData.decimals
  }

  const token: Token = {
    address: tokenContract.address,
    symbol: tokenData.symbol,
    name: tokenData.name,
    decimals: tokenData.decimals
  }

  return {
    prizePoolId: prizePool.id(),
    ticket,
    token
  }
}

const PRIZE_POOL_TOKENS = Object.freeze({
  [CHAIN_ID.mainnet]: [
    {
      prizePoolId: '0xd89a09084555a7D0ABe7B111b1f78DFEdDd638Be-1',
      ticket: {
        address: '0xdd4d117723C257CEe402285D3aCF218E9A8236E1',
        symbol: 'PTaUSDC',
        name: 'PoolTogether aUSDC Ticket',
        decimals: 6
      },
      token: {
        address: '0xA0b86991c6218b36c1d19D4a2e9Eb0cE3606eB48',
        symbol: 'USDC',
        name: 'USD Coin',
        decimals: 6
      }
    }
  ],
  [CHAIN_ID.polygon]: [
    {
      prizePoolId: '0x19DE635fb3678D8B8154E37d8C9Cdf182Fe84E60-137',
      ticket: {
        address: '0x6a304dFdb9f808741244b6bfEe65ca7B3b3A6076',
        symbol: 'PTaUSDC',
        name: 'PoolTogether aUSDC Ticket',
        decimals: 6
      },
      token: {
        address: '0x2791Bca1f2de4661ED88A30C99A7a9449Aa84174',
        symbol: 'USDC',
        name: 'USD Coin (PoS)',
        decimals: 6
      }
    }
  ],
  [CHAIN_ID.optimism]: [
    {
      prizePoolId: '0x79Bc8bD53244bC8a9C8c27509a2d573650A83373-10',
      ticket: {
        address: '0x62BB4fc73094c83B5e952C2180B23fA7054954c4',
        symbol: 'PTaOptUSDC',
        name: 'PoolTogether aOptUSDC Ticket',
        decimals: 6
      },
      token: {
        address: '0x7F5c764cBc14f9669B88837ca1490cCa17c31607',
        symbol: 'USDC',
        name: 'USD Coin',
        decimals: 6
      }
    }
  ],
  [CHAIN_ID.avalanche]: [
    {
      prizePoolId: '0xF830F5Cb2422d555EC34178E27094a816c8F95EC-43114',
      ticket: {
        address: '0xB27f379C050f6eD0973A01667458af6eCeBc1d90',
        symbol: 'PTavUSDCe',
        name: 'PoolTogether avUSDCe Ticket',
        decimals: 6
      },
      token: {
        address: '0xA7D7079b0FEaD91F3e65f86E8915Cb59c1a4C664',
        symbol: 'USDC.e',
        name: 'USD Coin',
        decimals: 6
      }
    }
  ]
})
