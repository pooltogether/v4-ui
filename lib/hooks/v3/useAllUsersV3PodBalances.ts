import { useQuery } from 'react-query'
import { Amount, usePodChainIds, useReadProviders } from '@pooltogether/hooks'
import { batch, contract } from '@pooltogether/etherplex'
import {
  addTokenTotalUsdValue,
  amountMultByUsd,
  sToMs,
  toScaledUsdBigNumber
} from '@pooltogether/utilities'

import PodAbi from 'abis/PodAbi'
import { useAllPodsByChainId } from 'lib/hooks/v3/useAllPodsByChainId'
import { BigNumber } from 'ethers'
import { getAmountFromBigNumber } from 'lib/utils/getAmountFromBigNumber'
import { Providers } from '@pooltogether/v4-js-client'

export interface PodBalance {
  pod: any
  address: string
  decimals: string
  derivedETH: string
  name: string
  symbol: string
  // numberOfHolders: string
  // totalSupply: string
  // totalSupplyUnformatted: BigNumber
  // totalValueUsd: string
  // totalValueUsdScaled: BigNumber
  usdPrice: number
  balance: Amount
  balanceUsd: Amount
  balanceValueUsdScaled: BigNumber
}

export const useAllUsersV3PodBalances = (usersAddress: string) => {
  const chainIds = usePodChainIds()
  const providers = useReadProviders(chainIds)
  const { data: podsByChainId, isFetched } = useAllPodsByChainId(providers)

  const enabled = isFetched && Boolean(podsByChainId) && Boolean(usersAddress)

  return useQuery(
    ['useAllUsersV3PodBalances', usersAddress],
    () => getAllPodTickets(providers, chainIds, podsByChainId, usersAddress),
    {
      enabled,
      refetchInterval: sToMs(20)
    }
  )
}

const getAllPodTickets = async (
  providers: Providers,
  chainIds: number[],
  podsByChainId: any,
  usersAddress: string
) => {
  const podTickets = await Promise.all(
    chainIds.map((chainId) => {
      return getPodTickets(usersAddress, providers[chainId], podsByChainId[chainId])
    })
  )

  const podTicketsByChainIds: { [chainId: number]: PodBalance[] } = {}
  chainIds.map((chainId, index) => {
    podTicketsByChainIds[chainId] = podTickets[index]
  })

  return podTicketsByChainIds
}

const getPodTickets = async (usersAddress, provider, pods) => {
  const batchCalls = []
  pods.forEach((pod) => {
    const podContract = contract(
      pod.tokens.podStablecoin.address,
      PodAbi,
      pod.tokens.podStablecoin.address
    )
    batchCalls.push(podContract.balanceOfUnderlying(usersAddress))
  })

  const response = await batch(provider, ...batchCalls)

  return formatPodTicketsResponse(pods, response)
}

const formatPodTicketsResponse = (pods, podTickets) => {
  const balances: PodBalance[] = []

  pods.forEach((pod) => {
    const podStablecoin = pod.tokens.podStablecoin
    const usdPrice = podStablecoin.usd
    const decimals = podStablecoin.decimals

    const balanceUnformatted = podTickets[pod.tokens.podStablecoin.address].balanceOfUnderlying[0]
    const balance = getAmountFromBigNumber(balanceUnformatted, decimals)
    const balanceValueUsdUnformatted = amountMultByUsd(balanceUnformatted, usdPrice)
    const balanceUsd = getAmountFromBigNumber(balanceValueUsdUnformatted, decimals)
    const balanceValueUsdScaled = toScaledUsdBigNumber(balanceUsd.amount)

    const podTicket: PodBalance = {
      pod,
      address: podStablecoin.address,
      decimals,
      derivedETH: podStablecoin.derivedETH,
      name: podStablecoin.name,
      symbol: podStablecoin.symbol,
      usdPrice,
      balance,
      balanceUsd,
      balanceValueUsdScaled
    }
    addTokenTotalUsdValue(podTicket, { [podTicket.address]: pod.tokens.podStablecoin })
    balances.push(podTicket)
  })

  return balances
}
