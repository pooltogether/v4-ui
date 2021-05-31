import { contractAddresses } from '@pooltogether/current-pool-data'
import { ethers } from 'ethers'
import { useMemo } from 'react'

import { useGovernanceChainId } from 'lib/hooks/useGovernanceChainId'

export const usePrizePoolAddresses = () => {
  const chainId = useGovernanceChainId()

  return useMemo(() => {
    const addresses = []

    const contracts = contractAddresses[chainId] || {}
    const contractKeys = Object.keys(contracts)

    contractKeys.forEach((key) => {
      if (contracts[key].prizePool) {
        addresses.push(ethers.utils.getAddress(contracts[key].prizePool))
      }
    })

    return addresses
  }, [chainId])
}
