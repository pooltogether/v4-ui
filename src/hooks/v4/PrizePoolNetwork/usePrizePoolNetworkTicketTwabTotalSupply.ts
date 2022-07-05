import { NO_REFETCH } from '@constants/query'
import { BigNumber } from '@ethersproject/bignumber'
import { getAmountFromBigNumber } from '@utils/getAmountFromBigNumber'
import { parseEther } from 'ethers/lib/utils'
import { useQuery } from 'react-query'
import { useAllPrizePoolTicketTwabTotalSupplies } from '../PrizePool/useAllPrizePoolTicketTwabTotalSupplies'

/**
 * Fetches the total supply of tickets that have been delegated at this current time.
 * Normalizes the ticket total supply amount to 18 decimals.
 * @returns
 */
export const usePrizePoolNetworkTicketTwabTotalSupply = () => {
  const queryResults = useAllPrizePoolTicketTwabTotalSupplies()
  const isFetched = queryResults.every((queryResult) => queryResult.isFetched)

  return useQuery(
    [
      'usePrizePoolNetworkTicketTwabTotalSupply',
      queryResults.map((q) => q.data?.prizePoolId).join('-'),
      queryResults.map((q) => q.data?.amount.amount).join('-')
    ],
    () => {
      let networkTotalSupplyNormalized = BigNumber.from(0)
      queryResults.forEach((queryResult) => {
        const { data: totalSupplyData, isFetched } = queryResult
        if (isFetched) {
          const totalSupplyNormalized = parseEther(totalSupplyData.amount.amount)
          networkTotalSupplyNormalized = networkTotalSupplyNormalized.add(totalSupplyNormalized)
        }
      })

      return {
        totalSupply: getAmountFromBigNumber(networkTotalSupplyNormalized, '18'),
        decimals: '18'
      }
    },
    {
      ...NO_REFETCH,
      enabled: isFetched
    }
  )
}
