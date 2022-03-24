import { getAmountFromBigNumber } from '@utils/getAmountFromBigNumber'
import { makeStablecoinTokenWithUsdBalance } from '@utils/makeStablecoinTokenWithUsdBalance'
import { useMemo } from 'react'
import { useSelectedPrizePoolTicket } from './useSelectedPrizePoolTicket'
import { useUsersTicketDelegateAllPools } from './useUsersTicketDelegateAllPools'
import { useUsersTotalTwab } from './useUsersTotalTwab'

/**
 * NOTE: Assumes all prize pool tickets have the same decimals
 * @param usersAddress
 * @returns
 */
export const useTotalAmountDelegatedTo = (usersAddress: string) => {
  const { data: ticket, isFetched: isTicketFetched } = useSelectedPrizePoolTicket()
  const {
    data: totalTwabData,
    isFetched: isTotalTwabFetched,
    refetch: refetchTotalTwab
  } = useUsersTotalTwab(usersAddress)

  const queryResults = useUsersTicketDelegateAllPools()
  const isFetched =
    isTotalTwabFetched && queryResults.every(({ isFetched }) => isFetched) && isTicketFetched
  const refetch = () => {
    refetchTotalTwab()
    queryResults.forEach(({ refetch }) => refetch())
  }
  const addressesMatch =
    isFetched &&
    queryResults.every(({ data }) => data.usersAddress === usersAddress) &&
    totalTwabData.usersAddress === usersAddress

  return useMemo(() => {
    if (!isFetched || !addressesMatch) {
      return {
        data: null,
        isFetched: false,
        refetch
      }
    }

    let totalAmountDelegatedToUserUnformatted = totalTwabData.twab.amountUnformatted
    const delegatedAmountPerChain = []

    queryResults.forEach((queryResult) => {
      const { delegate, prizePoolBalances, chainId } = queryResult.data
      const delegatedToSelf = delegate.toLowerCase() === usersAddress.toLowerCase()
      // TODO: Will need to expand this to be per prize pool, not just chain
      const twabData = totalTwabData.twabDataPerChain.find(
        (twabData) => twabData.chainId === chainId
      )

      const ticketBalanceUnformatted = prizePoolBalances.ticket
      let delegatedAmount = twabData.twab.amountUnformatted
      if (delegatedToSelf) {
        totalAmountDelegatedToUserUnformatted =
          totalAmountDelegatedToUserUnformatted.sub(ticketBalanceUnformatted)
        delegatedAmount = twabData.twab.amountUnformatted.sub(ticketBalanceUnformatted)
      }
      delegatedAmountPerChain.push({
        chainId,
        amount: getAmountFromBigNumber(delegatedAmount, ticket.decimals)
      })
    })

    const delegatedAmount = getAmountFromBigNumber(
      totalAmountDelegatedToUserUnformatted,
      ticket.decimals
    )
    const totalTokenWithUsdBalance = makeStablecoinTokenWithUsdBalance(
      totalAmountDelegatedToUserUnformatted,
      ticket
    )

    return {
      data: {
        usersAddress,
        delegatedAmount,
        totalTokenWithUsdBalance,
        delegatedAmountPerChain
      },
      isFetched: true,
      refetch
    }
  }, [isFetched, usersAddress, addressesMatch])
}
