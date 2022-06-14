import { BigNumber } from '@ethersproject/bignumber'
import { getAmountFromBigNumber } from '@utils/getAmountFromBigNumber'
import { parseEther } from 'ethers/lib/utils'
import { useAllPrizePoolTicketTwabTotalSupplies } from '../PrizePool/useAllPrizePoolTicketTwabTotalSupplies'

/**
 * Fetches the total supply of tickets that have been delegated at this current time.
 * Normalizes the ticket total supply amount to 18 decimals.
 * @returns
 */
export const usePrizePoolNetworkTicketTwabTotalSupply = () => {
  const queryResults = useAllPrizePoolTicketTwabTotalSupplies()

  const isFetched = queryResults.every((queryResult) => queryResult.isFetched)

  let networkTotalSupplyNormalized = BigNumber.from(0)
  queryResults.forEach((queryResult) => {
    const { data: totalSupplyData, isFetched } = queryResult
    if (isFetched) {
      const totalSupplyNormalized = parseEther(totalSupplyData.amount.amount)
      networkTotalSupplyNormalized = networkTotalSupplyNormalized.add(totalSupplyNormalized)
    }
  })

  return {
    data: {
      totalSupply: getAmountFromBigNumber(networkTotalSupplyNormalized, '18'),
      decimals: '18'
    },
    isFetched
  }
}
