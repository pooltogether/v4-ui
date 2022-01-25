import { batch, Context, contract } from '@pooltogether/etherplex'
import {
  Token,
  TokenWithBalance,
  useReadProviders,
  useCoingeckoTokenPricesAcrossChains,
  TokenPrices,
  Amount
} from '@pooltogether/hooks'
import { useQueries } from 'react-query'
import { Provider } from '@ethersproject/abstract-provider'

import ERC20Abi from 'abis/ERC20'
import { NO_REFETCH } from 'lib/constants/query'
import { useV3ChainIds } from './useV3ChainIds'
import { useV3PrizePools, V3PrizePool } from './useV3PrizePools'
import { getAmountFromBigNumber } from 'lib/utils/getAmountFromBigNumber'
import { amountMultByUsd, toScaledUsdBigNumber } from '@pooltogether/utilities'
import { BigNumber } from 'ethers'
import { formatUnits, parseUnits } from 'ethers/lib/utils'

export interface V3TokenBalance {
  chainId: number
  ticket: TokenWithBalance
  token: TokenWithBalance
  prizePool: V3PrizePool
  balanceUsd: Amount
  balanceUsdScaled: BigNumber
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
  const chainIds = useV3ChainIds()
  const providers = useReadProviders(chainIds)
  const { data: v3PrizePools, isFetched } = useV3PrizePools()
  const { data: tokenPrices, isFetched: isTokenPricesFetched } =
    useCoingeckoTokenPricesAcrossChains(isFetched ? formatTokens(v3PrizePools) : null)

  return useQueries(
    chainIds.map((chainId) => ({
      ...NO_REFETCH,
      queryKey: ['useAllUsersV3Balances', usersAddress, chainId],
      queryFn: async () =>
        getUsersV3BalancesByChainId(
          chainId,
          usersAddress,
          providers[chainId],
          v3PrizePools[chainId],
          tokenPrices
        ),
      enabled: isFetched && isTokenPricesFetched && Boolean(usersAddress)
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
const getUsersV3BalancesByChainId = async (
  chainId: number,
  usersAddress: string,
  provider: Provider,
  prizePools: V3PrizePool[],
  tokenPrices: TokenPrices
) => {
  let batchRequests: Context[] = []

  // Fetch balances
  prizePools.forEach((prizePool) => {
    const { ticket, token, sponsorship, podStablecoin } = prizePool.tokens

    const tokenContract = contract(token.address, ERC20Abi, token.address)
    const ticketContract = contract(ticket.address, ERC20Abi, ticket.address)
    const sponsorshipContract = contract(sponsorship.address, ERC20Abi, sponsorship.address)
    const podStablecoinContract = podStablecoin
      ? contract(podStablecoin.address, ERC20Abi, podStablecoin.address)
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
  const balances: V3TokenBalance[] = []

  prizePools.forEach((prizePool) => {
    const { ticket, token, sponsorship, podStablecoin } = prizePool.tokens

    const ticketWithBalance = makeTokenWithBalance(ticket, balanceOfResults)
    const tokenWithBalance = makeTokenWithBalance(token, balanceOfResults)
    const sponsorshipWithBalance = makeTokenWithBalance(sponsorship, balanceOfResults)
    const podStablecoinWithBalance = podStablecoin
      ? makeTokenWithBalance(podStablecoin, balanceOfResults)
      : null

    const tokenUsd = tokenPrices[token.address].usd

    const ticketBalance = makeV3TokenWithBalance(
      chainId,
      prizePool,
      ticketWithBalance,
      tokenWithBalance,
      tokenUsd
    )
    const sponsorshipBalance = makeV3TokenWithBalance(
      chainId,
      prizePool,
      sponsorshipWithBalance,
      tokenWithBalance,
      tokenUsd,
      { isSponsorship: true }
    )
    const podBalance = podStablecoinWithBalance
      ? makeV3TokenWithBalance(
          chainId,
          prizePool,
          podStablecoinWithBalance,
          tokenWithBalance,
          tokenUsd,
          { isPod: true, pricePerShare: podStablecoin.pricePerShare }
        )
      : null

    balances.push(ticketBalance, sponsorshipBalance)
    if (podBalance) {
      balances.push(podBalance)
    }
  })

  return {
    chainId,
    balances: balances
  }
}

const makeTokenWithBalance = (token: Token, etherplexBalanceOfResults): TokenWithBalance => {
  const balanceUnformatted = etherplexBalanceOfResults[token.address].balanceOf[0]
  const balance = getAmountFromBigNumber(balanceUnformatted, token.decimals)
  return {
    ...token,
    ...balance,
    hasBalance: !balance.amountUnformatted.isZero()
  }
}

const formatTokens = (v3PrizePools: {
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

/**
 * Formats for V3TokenBalance, calculating USD value
 * @param chainId
 * @param prizePool
 * @param ticket
 * @param token
 * @param usd
 * @returns
 */
const makeV3TokenWithBalance = (
  chainId: number,
  prizePool: V3PrizePool,
  ticket: TokenWithBalance,
  token: TokenWithBalance,
  usd: number,
  additionalData?: { isSponsorship?: boolean; isPod?: boolean; pricePerShare?: Amount }
): V3TokenBalance => {
  const balanceUsdUnformatted = additionalData?.isPod
    ? amountMultByUsd(
        ticket.amountUnformatted
          .mul(parseUnits('1', ticket.decimals))
          .mul(additionalData.pricePerShare.amountUnformatted)
          .div(parseUnits('1', ticket.decimals))
          .div(parseUnits('1', ticket.decimals)),
        usd
      )
    : amountMultByUsd(ticket.amountUnformatted, usd)
  const balanceUsd = getAmountFromBigNumber(balanceUsdUnformatted, ticket.decimals)
  const balanceUsdScaled = toScaledUsdBigNumber(balanceUsd.amount)

  return {
    balanceUsdScaled,
    balanceUsd,
    chainId,
    ticket,
    token,
    prizePool,
    pricePerShare: additionalData?.pricePerShare,
    isPod: additionalData?.isPod,
    isSponsorship: additionalData?.isSponsorship
  }
}
