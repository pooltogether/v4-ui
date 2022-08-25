import { BigNumber } from '@ethersproject/bignumber'
import { getAmountFromBigNumber } from '@utils/getAmountFromBigNumber'
import { parseEther } from 'ethers/lib/utils'
import { useQuery } from 'react-query'

import { useAllPrizePoolTicketTotalSupplies } from '../PrizePool/useAllPrizePoolTicketTotalSupplies'

/**
 * Fetches the total supply of tickets at this current time.
 * Normalizes the ticket total supply amount to 18 decimals.
 * @returns
 */
export const usePrizePoolNetworkTicketTotalSupply = () => {
  const queryResults = useAllPrizePoolTicketTotalSupplies()
  const isFetched = queryResults.every((queryResult) => queryResult.isFetched)

  return useQuery(
    [
      'usePrizePoolNetworkTicketTotalSupply',
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
      enabled: isFetched
    }
  )
}
