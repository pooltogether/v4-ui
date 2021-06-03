import { batch, contract } from '@pooltogether/etherplex'
import { useQuery } from 'react-query'
import { ethers } from 'ethers'

import { useOnboard } from '@pooltogether/hooks'
import DelegateableERC20ABI from 'abis/DelegateableERC20ABI'
import { CONTRACT_ADDRESSES, QUERY_KEYS } from 'lib/constants'
import { useReadProvider } from 'lib/hooks/useReadProvider'
import { useGovernanceChainId } from 'lib/hooks/useGovernanceChainId'

export const usePoolTokenData = () => {
  const { address: usersAddress } = useOnboard()
  const chainId = useGovernanceChainId()
  const { readProvider, isLoaded: readProviderIsLoaded } = useReadProvider()

  return useQuery(
    [QUERY_KEYS.poolTokenDataQuery, chainId, usersAddress],
    async () => {
      return getPoolTokenData(readProvider, chainId, usersAddress)
    },
    {
      enabled: Boolean(chainId && readProviderIsLoaded && usersAddress)
    }
  )
}

const getPoolTokenData = async (provider, chainId, usersAddress) => {
  const poolAddress = CONTRACT_ADDRESSES[chainId].GovernanceToken
  const poolContract = contract('pool', DelegateableERC20ABI, poolAddress)

  try {
    const poolChainData = await batch(
      provider,
      poolContract.balanceOf(usersAddress).decimals().totalSupply()
    )

    const totalSupplyBN = poolChainData.pool.totalSupply[0]
    const usersBalanceBN = poolChainData.pool.balanceOf[0]
    const decimals = poolChainData.pool.decimals[0]

    return {
      ...poolChainData.pool,
      usersBalanceBN,
      usersBalance: Number(ethers.utils.formatUnits(usersBalanceBN, decimals)),
      decimals,
      totalSupplyBN,
      totalSupply: Number(ethers.utils.formatUnits(totalSupplyBN, decimals))
    }
  } catch (error) {
    console.error(error.message)
    return {}
  }
}
