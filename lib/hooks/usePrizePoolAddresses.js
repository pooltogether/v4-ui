import { contractAddresses } from '@pooltogether/current-pool-data'
import { ethers } from 'ethers'
import { useOnboard } from '@pooltogether/hooks'
import { useMemo } from 'react'

export const usePrizePoolAddresses = () => {
  const { network: chainId } = useOnboard()

  return useMemo(() => {
    const addresses = []

    const contracts = contractAddresses[chainId]
    const contractKeys = Object.keys(contracts)

    contractKeys.forEach((key) => {
      if (contracts[key].prizePool) {
        addresses.push(ethers.utils.getAddress(contracts[key].prizePool))
      }
    })

    return addresses
  }, [chainId])
}
