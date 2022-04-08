import { useSupportedChainIds } from '@hooks/useSupportedChainIds'
import { getReadProvider } from '@pooltogether/utilities'
import {
  Delegation,
  DelegationId,
  TwabDelegator,
  TWAB_DELEGATOR_ADDRESS
} from '@pooltogether/v4-twab-delegator-js'
import { getAmountFromBigNumber } from '@utils/getAmountFromBigNumber'
import { makeStablecoinTokenWithUsdBalance } from '@utils/makeStablecoinTokenWithUsdBalance'
import { BigNumber } from 'ethers'
import { useQuery } from 'react-query'
import { useSupportedTwabDelegatorChainIds } from './useSupportedTwabDelegatorChainIds'

/**
 * NOTE: This will need to be expanded for multiple prize pools on the same chain
 * Fetches all of the TWAB Delegator delegations for a specific address across all supported chains
 * @param delegator
 * @returns
 */
export const useAllTwabDelegations = (delegator: string) => {
  const supportedChainIds = useSupportedTwabDelegatorChainIds()

  return useQuery(
    ['useAllTwabDelegations', supportedChainIds, delegator],
    () => getAllTwabDelegations(supportedChainIds, delegator),
    {
      enabled: !!delegator
    }
  )
}

const getAllTwabDelegations = async (chainIds: number[], delegator: string) => {
  const promises = chainIds.map((chainId) => getDelegations(chainId, delegator))
  const delegations = await Promise.all(promises)
  // NOTE: This is hacky. Assuming all have the same decimals and ticket image.
  const ticket = delegations[0].ticket
  const totalAmountUnformatted = delegations.reduce(
    (sum, data) => sum.add(data.totalAmount.amountUnformatted),
    BigNumber.from(0)
  )
  const totalAmount = getAmountFromBigNumber(totalAmountUnformatted, ticket.decimals)
  const totalTokenWithUsdBalance = makeStablecoinTokenWithUsdBalance(totalAmountUnformatted, ticket)
  return {
    ticket,
    delegations,
    totalAmount,
    totalTokenWithUsdBalance
  }
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
