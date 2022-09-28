import Erc20Abi from '@abis/ERC20'
import { Provider } from '@ethersproject/abstract-provider'
import { BigNumber } from '@ethersproject/bignumber'
import { parseUnits } from '@ethersproject/units'
import { batch, Context, contract } from '@pooltogether/etherplex'
import {
  Token,
  TokenWithUsdBalance,
  useCoingeckoTokenPricesAcrossChains,
  Amount,
  TokenPrice
} from '@pooltogether/hooks'
import { amountMultByUsd, toScaledUsdBigNumber } from '@pooltogether/utilities'
import { useReadProviders } from '@pooltogether/wallet-connection'
import { getAmountFromBigNumber } from '@utils/getAmountFromBigNumber'
import { useQueries } from 'react-query'
import { PodToken, useV3PrizePools, V3PrizePool } from './useV3PrizePools'


export interface V3PrizePoolBalances {
  chainId: number
  ticket: TokenWithUsdBalance
  token: TokenWithUsdBalance
  prizePool: V3PrizePool
  pricePerShare?: Amount
  isPod?: boolean
  isSponsorship?: boolean
}

/**
 * Fetch users balances for all tokens in all prize pools
 * @param usersAddress
 * @returns
 */
export const useAllUsersV3Balances = (usersAddress: string) => {
  const { data: v3PrizePools, isFetched } = useV3PrizePools()
  const chainIds = isFetched ? Object.keys(v3PrizePools).map(Number) : []
  const providers = useReadProviders(chainIds)
  const { data: tokenPrices } = useCoingeckoTokenPricesAcrossChains(
    isFetched ? getTokenAddressesFromPrizePools(v3PrizePools) : null
  )

  return useQueries(
    chainIds.map((chainId) => ({
      queryKey: ['useAllUsersV3Balances', usersAddress, chainId, tokenPrices],
      queryFn: async () =>
        getUserV3BalancesByChainId(
          chainId,
          usersAddress,
          providers[chainId],
          v3PrizePools[chainId],
          tokenPrices
        ),
      enabled: isFetched && Boolean(usersAddress)
    }))
  )
}

/**
 * Fetch balances for user for all tokens
 * @param chainId
 * @param usersAddress
 * @param provider
 * @param prizePools
 * @returns
 */
const getUserV3BalancesByChainId = async (
  chainId: number,
  usersAddress: string,
  provider: Provider,
  prizePools: V3PrizePool[],
  tokenPrices: {
    [id: string]: TokenPrice
  }
) => {
  let batchRequests: Context[] = []

  // Fetch balances
  prizePools.forEach((prizePool) => {
    const { ticket, token, sponsorship, podStablecoin } = prizePool.tokens

    const tokenContract = contract(token.address, Erc20Abi, token.address)
    const ticketContract = contract(ticket.address, Erc20Abi, ticket.address)
    const sponsorshipContract = contract(sponsorship.address, Erc20Abi, sponsorship.address)
    const podStablecoinContract = podStablecoin
      ? contract(podStablecoin.address, Erc20Abi, podStablecoin.address)
      : null

    batchRequests.push(
      tokenContract.balanceOf(usersAddress),
      ticketContract.balanceOf(usersAddress),
      sponsorshipContract.balanceOf(usersAddress)
    )
    if (!!podStablecoinContract) {
      batchRequests.push(podStablecoinContract.balanceOf(usersAddress))
    }
  })
  const balanceOfResults = await batch(provider, ...batchRequests)

  // Format balances, merge USD data
  const balances: V3PrizePoolBalances[] = []

  prizePools.forEach((prizePool) => {
    const { ticket, token, sponsorship, podStablecoin } = prizePool.tokens

    const tokenUsd = tokenPrices?.[token.address]?.usd
    const tokenWithUsdBalance = makeTokenWithUsdBalance(token, tokenUsd, balanceOfResults)
    const ticketWithUsdBalance = makeTokenWithUsdBalance(ticket, tokenUsd, balanceOfResults)
    const sponsorshipWithUsdBalance = makeTokenWithUsdBalance(
      sponsorship,
      tokenUsd,
      balanceOfResults
    )
    const podStablecoinWithUsdBalance = podStablecoin
      ? makePodStablecoinTokenWithUsdBalance(podStablecoin, tokenUsd, balanceOfResults)
      : null

    const ticketBalance: V3PrizePoolBalances = {
      chainId,
      ticket: ticketWithUsdBalance,
      token: tokenWithUsdBalance,
      prizePool
    }
    const sponsorshipBalance: V3PrizePoolBalances = {
      chainId,
      ticket: sponsorshipWithUsdBalance,
      token: tokenWithUsdBalance,
      prizePool,
      isSponsorship: true
    }
    const podBalance: V3PrizePoolBalances = podStablecoinWithUsdBalance
      ? {
          chainId,
          ticket: podStablecoinWithUsdBalance,
          token: tokenWithUsdBalance,
          prizePool,
          pricePerShare: podStablecoin.pricePerShare,
          isPod: true
        }
      : null

    balances.push(ticketBalance, sponsorshipBalance)
    if (podBalance) {
      balances.push(podBalance)
    }
  })

  return {
    chainId,
    balances: balances,
    isTokenPricesFetched: Boolean(tokenPrices)
  }
}

/**
 * Format data. Calculate USD value of token balance.
 * @param token
 * @param usdPerToken
 * @param etherplexBalanceOfResults
 * @returns
 */
const makeTokenWithUsdBalance = (
  token: Token,
  usdPerToken: number,
  etherplexBalanceOfResults
): TokenWithUsdBalance => {
  const balanceUnformatted = etherplexBalanceOfResults[token.address].balanceOf[0]
  const balance = getAmountFromBigNumber(balanceUnformatted, token.decimals)
  const balanceUsdUnformatted = usdPerToken
    ? amountMultByUsd(balanceUnformatted, usdPerToken)
    : BigNumber.from(0)
  const balanceUsd = getAmountFromBigNumber(balanceUsdUnformatted, token.decimals)
  const balanceUsdScaled = toScaledUsdBigNumber(balanceUsd.amount)
  return {
    ...token,
    ...balance,
    usdPerToken,
    balanceUsd,
    balanceUsdScaled,
    hasBalance: !balance.amountUnformatted.isZero()
  }
}

/**
 * Format data. Calculate USD value of token balance.
 * Converts balance of pod stablecoin to the amount of the underlying token then multiplies by price.
 * @param token
 * @param usdPerToken
 * @param etherplexBalanceOfResults
 * @returns
 */
const makePodStablecoinTokenWithUsdBalance = (
  token: PodToken,
  usdPerToken: number,
  etherplexBalanceOfResults
): TokenWithUsdBalance => {
  const balanceUnformatted = etherplexBalanceOfResults[token.address].balanceOf[0]
  const balance = getAmountFromBigNumber(balanceUnformatted, token.decimals)
  const balanceUsdUnformatted = usdPerToken
    ? amountMultByUsd(
        balanceUnformatted
          .mul(parseUnits('1', token.decimals))
          .mul(token.pricePerShare.amountUnformatted)
          .div(parseUnits('1', token.decimals))
          .div(parseUnits('1', token.decimals)),
        usdPerToken
      )
    : BigNumber.from(0)
  const balanceUsd = getAmountFromBigNumber(balanceUsdUnformatted, token.decimals)
  const balanceUsdScaled = toScaledUsdBigNumber(balanceUsd.amount)
  return {
    ...token,
    ...balance,
    usdPerToken,
    balanceUsd,
    balanceUsdScaled,
    hasBalance: !balance.amountUnformatted.isZero()
  }
}

/**
 * Pulls token addresses from prize pools
 * @param v3PrizePools
 * @returns
 */
const getTokenAddressesFromPrizePools = (v3PrizePools: {
  [chainId: number]: V3PrizePool[]
}): { [chainId: number]: string[] } => {
  const tokens: {
    [chainId: number]: string[]
  } = {}

  Object.keys(v3PrizePools)
    .map(Number)
    .forEach((chainId) => {
      tokens[chainId] = []
      v3PrizePools[chainId].forEach((prizePool) => {
        tokens[chainId].push(prizePool.tokens.token.address)
      })
    })

  return tokens
}
