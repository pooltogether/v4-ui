import { prizePoolContracts } from '@pooltogether/current-pool-data'
import { useQuery } from 'react-query'
import { Amount, Token, useReadProviders } from '@pooltogether/hooks'
import { Provider } from '@ethersproject/abstract-provider'
import { batch, Context, contract } from '@pooltogether/etherplex'

import { useV3ChainIds } from './useV3ChainIds'
import ERC20Abi from 'abis/ERC20'
import PrizePoolAbi from 'abis/V3_PrizePool'
import PodAbi from 'abis/V3_Pod'
import PrizeStrategyAbi from 'abis/V3_PrizeStrategy'
import { NO_REFETCH } from 'lib/constants/query'
import { CHAIN_ID } from 'lib/constants/constants'
import { getAmountFromBigNumber } from 'lib/utils/getAmountFromBigNumber'

interface PodToken extends Token {
  pricePerShare: Amount
}

const PRIZE_POOL_ADDRESSES_TO_FILTER = Object.freeze({
  [CHAIN_ID.rinkeby]: ['0xc7d56c06F136EFff93e349C7BF8cc46bBF5D902c']
})

const POD_ADDRESSES = Object.freeze({
  [CHAIN_ID.mainnet]: [
    {
      // DAI Pod
      pod: '0x2f994e2E4F3395649eeE8A89092e63Ca526dA829',
      prizePool: '0xEBfb47A7ad0FD6e57323C8A42B2E5A6a4F68fc1a'
    },
    {
      // USDC Pod
      pod: '0x386EB78f2eE79AddE8Bdb0a0e27292755ebFea58',
      prizePool: '0xde9ec95d7708B8319CCca4b8BC92c0a3B70bf416'
    }
  ],
  [CHAIN_ID.rinkeby]: [
    {
      // DAI Pod
      pod: '0x4A26b34A902045CFb573aCb681550ba30AA79783',
      prizePool: '0x4706856FA8Bb747D50b4EF8547FE51Ab5Edc4Ac2'
    }
  ]
})

export interface V3PrizePool {
  chainId: number
  addresses: {
    prizePool: string
    prizeStrategy: string
    token: string
    ticket: string
    sponsorship: string
    pod?: string
  }
  tokens: {
    token: Token
    ticket: Token
    sponsorship: Token
    podStablecoin?: PodToken
  }
}

/**
 * Fetches v3 Prize Pool contract addresses and token data
 * @returns
 */
export const useV3PrizePools = () => {
  const chainIds = useV3ChainIds()
  const providers = useReadProviders(chainIds)

  return useQuery(['useV3PrizePools', chainIds], () => getV3PrizePools(chainIds, providers), {
    ...NO_REFETCH
  })
}

/**
 * Fetch all of the data on a per chain id basis and merge data
 * @param chainIds
 * @param providers
 * @returns
 */
const getV3PrizePools = async (
  chainIds: number[],
  providers: {
    [chainId: number]: Provider
  }
) => {
  const prizePoolAddressByChainId = getPrizePoolAddresses(chainIds)

  const prizePoolsByChainId: {
    [chainId: number]: V3PrizePool[]
  } = {}

  await Promise.all(
    chainIds.map(async (chainId) => {
      const prizePoolAddresses = prizePoolAddressByChainId[chainId]
      const prizePools = await getPrizePools(chainId, providers[chainId], prizePoolAddresses)
      prizePoolsByChainId[chainId] = prizePools
    })
  )

  console.log({ prizePoolsByChainId })

  return prizePoolsByChainId
}

/**
 * Filter the current-pool-data for just the prize pool addresses
 * @param chainIds
 * @returns
 */
const getPrizePoolAddresses = (chainIds: number[]) => {
  const prizePoolAddresses: {
    [chainId: number]: string[]
  } = {}

  chainIds.forEach((chainId) => {
    const { governance, community } = prizePoolContracts[chainId]

    const addressesToFilter = PRIZE_POOL_ADDRESSES_TO_FILTER[chainId]

    const prizePoolAddressesForChainId: string[] = [
      ...governance.map((prizePool) => prizePool.prizePool.address),
      ...community.map((prizePool) => prizePool.prizePool.address)
    ].filter((address) => !addressesToFilter?.includes(address))

    prizePoolAddresses[chainId] = prizePoolAddressesForChainId
  })
  return prizePoolAddresses
}

/**
 * Fetch the prize pool contract addresses and then the token data
 * @param provider
 * @param prizePoolAddresses
 * @returns
 */
const getPrizePools = async (chainId: number, provider: Provider, prizePoolAddresses: string[]) => {
  let batchRequests: Context[] = []

  if (!prizePoolAddresses.length) {
    return []
  }

  // Fetch addresses from Prize Pool contract
  prizePoolAddresses.forEach((prizePoolAddress) => {
    const prizePoolContract = contract(prizePoolAddress, PrizePoolAbi, prizePoolAddress)
    batchRequests.push(prizePoolContract.prizeStrategy().token())
  })

  const prizePoolContractAddressesResults = await batch(provider, ...batchRequests)
  batchRequests = []

  // Fetch addresses from Prize Strategy contract
  prizePoolAddresses.forEach((prizePoolAddress) => {
    const prizeStrategyAddress =
      prizePoolContractAddressesResults[prizePoolAddress].prizeStrategy[0]
    const prizeStrategyContract = contract(
      prizeStrategyAddress,
      PrizeStrategyAbi,
      prizeStrategyAddress
    )

    batchRequests.push(prizeStrategyContract.sponsorship().ticket())
  })
  const prizeStrategyContractAddressesResults = await batch(provider, ...batchRequests)
  batchRequests = []

  // Fetch Token data for prize pools
  prizePoolAddresses.forEach((prizePoolAddress) => {
    const prizeStrategyAddress =
      prizePoolContractAddressesResults[prizePoolAddress].prizeStrategy[0]
    const tokenAddress = prizePoolContractAddressesResults[prizePoolAddress].token[0]
    const prizeStrategyAddresses = prizeStrategyContractAddressesResults[prizeStrategyAddress]

    const ticketAddress = prizeStrategyAddresses.ticket[0]
    const sponsorshipTicketAddress = prizeStrategyAddresses.sponsorship[0]

    const ticketContract = contract(ticketAddress, ERC20Abi, ticketAddress)
    const tokenContract = contract(tokenAddress, ERC20Abi, tokenAddress)
    const sponsorshipTicketContract = contract(
      sponsorshipTicketAddress,
      ERC20Abi,
      sponsorshipTicketAddress
    )

    batchRequests.push(
      ticketContract.name().symbol().decimals(),
      tokenContract.name().symbol().decimals(),
      sponsorshipTicketContract.name().symbol().decimals()
    )

    // Fetch Pod data
    const podAddress = getPodAddress(chainId, prizePoolAddress)
    if (!!podAddress) {
      const podStablecoinContract = contract(podAddress, PodAbi, podAddress)
      batchRequests.push(podStablecoinContract.name().symbol().decimals().getPricePerShare())
    }
  })
  const tokenResults = await batch(provider, ...batchRequests)
  batchRequests = []

  const v3PrizePools: V3PrizePool[] = []

  // Final, build
  prizePoolAddresses.forEach((prizePoolAddress) => {
    const prizePoolContractAddresses = prizePoolContractAddressesResults[prizePoolAddress]
    const prizeStrategyAddress = prizePoolContractAddresses.prizeStrategy[0]
    const prizeStategyContractAddresses =
      prizeStrategyContractAddressesResults[prizeStrategyAddress]

    const tokenAddress = prizePoolContractAddresses.token[0]
    const ticketAddress = prizeStategyContractAddresses.ticket[0]
    const sponsorshipAddress = prizeStategyContractAddresses.sponsorship[0]

    const token = makeToken(tokenAddress, tokenResults[tokenAddress])
    const ticket = makeToken(ticketAddress, tokenResults[ticketAddress])
    const sponsorship = makeToken(sponsorshipAddress, tokenResults[sponsorshipAddress])

    const podAddress = getPodAddress(chainId, prizePoolAddress)
    const podStablecoin = podAddress ? makePodToken(podAddress, tokenResults[podAddress]) : null

    v3PrizePools.push({
      chainId,
      addresses: {
        prizePool: prizePoolAddress,
        prizeStrategy: prizeStrategyAddress,
        token: tokenAddress,
        ticket: ticketAddress,
        sponsorship: sponsorshipAddress,
        pod: podAddress
      },
      tokens: {
        token,
        ticket,
        sponsorship,
        podStablecoin
      }
    })
  })

  console.log({ v3PrizePools })

  return v3PrizePools
}

/**
 * Convert an etherplex response to a Token
 * @param tokenAddress
 * @param etherplexTokenResponse
 * @returns
 */
const makeToken = (tokenAddress: string, etherplexTokenResponse): Token => {
  return {
    address: tokenAddress,
    symbol: etherplexTokenResponse.symbol[0],
    name: etherplexTokenResponse.name[0],
    decimals: etherplexTokenResponse.decimals[0]
  }
}

/**
 * Convert an etherplex response to a PodToken
 * @param tokenAddress
 * @param etherplexTokenResponse
 * @returns
 */
const makePodToken = (tokenAddress: string, etherplexTokenResponse): PodToken => {
  return {
    address: tokenAddress,
    symbol: etherplexTokenResponse.symbol[0],
    name: etherplexTokenResponse.name[0],
    decimals: etherplexTokenResponse.decimals[0],
    pricePerShare: getAmountFromBigNumber(
      etherplexTokenResponse.getPricePerShare[0],
      etherplexTokenResponse.decimals[0]
    )
  }
}

/**
 * Finds pod data in the pod addresses constant
 * @param chainId
 * @param prizePoolAddress
 * @returns
 */
const getPodAddress = (chainId: number, prizePoolAddress: string) => {
  const pods = POD_ADDRESSES?.[chainId]
  return pods
    ? pods.find((pod) => pod.prizePool.toLowerCase() === prizePoolAddress.toLowerCase())?.pod
    : null
}
