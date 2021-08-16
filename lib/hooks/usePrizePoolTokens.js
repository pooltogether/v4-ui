import { useTokenBalances, useUsersAddress } from '@pooltogether/hooks'
import { ethers } from 'ethers'
import { usePoolChainId } from 'lib/hooks/usePoolChainId'
import { usePrizePool } from 'lib/hooks/usePrizePool'

/**
 * @param {*} address Address to query balances for all of the relevant tokens for a Prize Pool. Defaults to the zero address so we can use total supply & token names.
 */
export const usePrizePoolTokens = (address = ethers.constants.AddressZero) => {
  const chainId = usePoolChainId()
  const prizePool = usePrizePool()
  return useTokenBalances(
    chainId,
    address,
    Object.values(prizePool.tokens).map((token) => token.address)
  )
}
