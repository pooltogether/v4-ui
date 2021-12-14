import { BigNumber } from 'ethers'
import { useUsersAddress } from 'lib/hooks/useUsersAddress'
import { getAmountFromBigNumber } from 'lib/utils/getAmountFromBigNumber'
import { useUsersV4Balances } from './useUsersV4Balances'

// NOTE: Assumes v4 balances are USD stable coins
export const useUsersTotalPrizePoolBalances = () => {
  const usersAddress = useUsersAddress()
  const queriesResult = useUsersV4Balances(usersAddress)
  const v4Balances = queriesResult?.map((queryResult) => queryResult.data)
  const isV4Fetched = queriesResult.every((queryResult) => queryResult.isFetched)

  if (!isV4Fetched) {
    return { data: null, isFetched: false }
  }

  let decimals: string
  const v4TotalBalanceAmountUnformatted = v4Balances.reduce((acc, curr) => {
    if (!decimals) {
      decimals = curr.balances.ticket.decimals
    }
    return acc.add(curr.balances.ticket.amountUnformatted)
  }, BigNumber.from(0))

  const v4TotalBalance = getAmountFromBigNumber(v4TotalBalanceAmountUnformatted, decimals)

  const totalBalanceUnformated = v4TotalBalanceAmountUnformatted
  const totalBalance = getAmountFromBigNumber(totalBalanceUnformated, decimals)

  return {
    data: {
      v4TotalBalance,
      totalBalance
    },
    isFetched: true
  }
}
