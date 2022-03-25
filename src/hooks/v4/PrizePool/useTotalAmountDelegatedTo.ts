import { getAmountFromBigNumber } from '@utils/getAmountFromBigNumber'
import { makeStablecoinTokenWithUsdBalance } from '@utils/makeStablecoinTokenWithUsdBalance'
import { useSelectedPrizePoolTicket } from './useSelectedPrizePoolTicket'
import { useAllUsersTicketDelegates } from './useAllUsersTicketDelegates'
import { useUsersTotalTwab } from './useUsersTotalTwab'
import { useAllUsersV4Balances } from './useAllUsersV4Balances'
import { useQuery } from 'react-query'

/**
 * Aggregates data to calculate the total amount delegated to a user
 * NOTE: Assumes all prize pool tickets have the same decimals
 * NOTE: Refetch won't actually refetch data.
 * @param usersAddress
 * @returns
 */
export const useTotalAmountDelegatedTo = (usersAddress: string) => {
  const { data: ticket, isFetched: isTicketFetched } = useSelectedPrizePoolTicket()
  const { data: totalTwabData, isFetched: isTotalTwabFetched } = useUsersTotalTwab(usersAddress)
  const { data: usersBalances, isFetched: isUsersBalancesFetched } =
    useAllUsersV4Balances(usersAddress)
  const ticketDelegates = useAllUsersTicketDelegates(usersAddress)
  const isFetched =
    isTotalTwabFetched &&
    ticketDelegates.every(({ isFetched }) => isFetched) &&
    isTicketFetched &&
    isUsersBalancesFetched

  const addressesMatch =
    isFetched &&
    ticketDelegates.every(({ data }) => data.usersAddress === usersAddress) &&
    totalTwabData.usersAddress === usersAddress

  return useQuery(
    [
      'useTotalAmountDelegatedTo',
      usersAddress,
      totalTwabData?.twab.amount,
      usersBalances?.totalValueUsd.amount,
      ticketDelegates?.map((ticketDelegateData) => ticketDelegateData.data?.ticketDelegate)
    ],
    () => {
      let totalAmountDelegatedToUserUnformatted = totalTwabData.twab.amountUnformatted
      const delegatedAmountPerChain = []

      ticketDelegates.forEach((queryResult) => {
        const { ticketDelegate, prizePool } = queryResult.data
        const delegatedToSelf = ticketDelegate.toLowerCase() === usersAddress.toLowerCase()
        // TODO: Will need to expand this to be per prize pool, not just chain
        const twabData = totalTwabData.twabDataPerChain.find(
          (twabData) => twabData.chainId === prizePool.chainId
        )

        const balancesData = usersBalances.balances.find(
          (balance) => balance.prizePool.id() === prizePool.id()
        )
        const ticketBalanceUnformatted = balancesData.balances.ticket.amountUnformatted
        let delegatedAmount = twabData.twab.amountUnformatted
        if (delegatedToSelf) {
          totalAmountDelegatedToUserUnformatted =
            totalAmountDelegatedToUserUnformatted.sub(ticketBalanceUnformatted)
          delegatedAmount = twabData.twab.amountUnformatted.sub(ticketBalanceUnformatted)
        }
        delegatedAmountPerChain.push({
          chainId: prizePool.chainId,
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
        usersAddress,
        delegatedAmount,
        totalTokenWithUsdBalance,
        delegatedAmountPerChain
      }
    },
    {
      enabled: !!usersAddress && isFetched && addressesMatch
    }
  )
}
