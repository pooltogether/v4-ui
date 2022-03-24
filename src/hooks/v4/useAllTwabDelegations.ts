import { useAppEnvString } from '@hooks/useAppEnvString'
import { Amount, TokenWithUsdBalance } from '@pooltogether/hooks'
import { NO_REFETCH } from '@pooltogether/hooks/dist/constants'
import { getReadProvider } from '@pooltogether/utilities'
import {
  Delegation,
  DelegationId,
  SUPPORTED_CHAIN_IDS,
  TwabDelegator,
  TWAB_DELEGATOR_ADDRESS
} from '@pooltogether/v4-twab-delegator-js'
import { getAmountFromBigNumber } from '@utils/getAmountFromBigNumber'
import { makeStablecoinTokenWithUsdBalance } from '@utils/makeStablecoinTokenWithUsdBalance'
import { BigNumber } from 'ethers'
import { useMemo } from 'react'
import { useQueries, UseQueryOptions } from 'react-query'

/**
 * NOTE: This will need to be expanded for multiple prize pools on the same chain
 * @param delegator
 * @returns
 */
export const useAllTwabDelegations = (
  delegator: string
): {
  isFetched: boolean
  isFetching: boolean
  refetch: () => void
  data: {
    ticket: {
      address: string
      symbol: string
      name: string
      decimals: string
    }
    delegationsPerChain: {
      chainId: number
      delegations: (DelegationId & Delegation)[]
      ticket: {
        address: string
        symbol: string
        name: string
        decimals: string
      }
      totalAmount: Amount
    }[]
    totalAmount: Amount
    totalTokenWithUsdBalance: TokenWithUsdBalance
  }
} => {
  const appEnv = useAppEnvString()
  const queriesResult = useQueries<
    UseQueryOptions<{
      chainId: number
      delegations: (DelegationId & Delegation)[]
      ticket: {
        address: string
        symbol: string
        name: string
        decimals: string
      }
      totalAmount: Amount
    }>[]
  >(
    SUPPORTED_CHAIN_IDS[appEnv].map((chainId) => ({
      ...NO_REFETCH,
      queryKey: ['useDelegations', chainId, delegator],
      enabled: !!delegator,
      queryFn: () => getDelegations(chainId, delegator)
    }))
  )

  const isFetched = queriesResult.every(({ isFetched }) => isFetched)
  const isFetching = queriesResult.some(({ isFetching }) => isFetching)

  return useMemo(() => {
    const refetch = () => queriesResult.forEach(({ refetch }) => refetch())
    if (!isFetched) {
      return {
        isFetching,
        isFetched: false,
        data: undefined,
        refetch
      }
    }

    const delegationsPerChain = queriesResult.map(({ data }) => data)
    // NOTE: This is hacky. Assuming all have the same decimals and ticket image.
    const ticket = queriesResult[0].data.ticket
    const totalAmountUnformatted = delegationsPerChain.reduce(
      (sum, data) => sum.add(data.totalAmount.amountUnformatted),
      BigNumber.from(0)
    )
    const totalAmount = getAmountFromBigNumber(totalAmountUnformatted, ticket.decimals)
    const totalTokenWithUsdBalance = makeStablecoinTokenWithUsdBalance(
      totalAmountUnformatted,
      ticket
    )

    return {
      isFetching,
      isFetched,
      refetch,
      data: {
        ticket,
        delegationsPerChain,
        totalAmount,
        totalTokenWithUsdBalance
      }
    }
  }, [isFetched, isFetching, delegator])
}

/**
 *
 * @param chainId
 * @param delegator
 * @returns
 */
const getDelegations = async (chainId: number, delegator: string) => {
  const provider = getReadProvider(chainId)
  const twabDelegatorAddress = TWAB_DELEGATOR_ADDRESS[chainId]
  const twabDelegator = new TwabDelegator(chainId, provider, twabDelegatorAddress)
  const delegations = await fetchAllPagesOfDelegations(twabDelegator, delegator)
  const ticket = await twabDelegator.getTicket()
  const totalAmountUnformatted = delegations.reduce(
    (sum, delegation) => sum.add(delegation.balance),
    BigNumber.from(0)
  )
  const totalAmount = getAmountFromBigNumber(totalAmountUnformatted, ticket.decimals)

  return {
    chainId,
    delegations,
    ticket,
    totalAmount
  }
}

/**
 *
 * @param twabDelegator
 * @param delegator
 */
const fetchAllPagesOfDelegations = async (twabDelegator: TwabDelegator, delegator: string) => {
  const delegations: (DelegationId & Delegation)[] = []
  const pageSize = 25

  const fetchPage = async (page: number) => {
    const _delegations = await twabDelegator.getDelegationsByPage(delegator, page, pageSize)
    if (_delegations.length > 0) {
      delegations.push(..._delegations)
      if (_delegations.length >= pageSize - 3) {
        return await fetchPage(page + 1)
      }
    }
    return
  }

  await fetchPage(0)
  return delegations
}
