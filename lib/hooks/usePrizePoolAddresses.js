import { contractAddresses } from '@pooltogether/current-pool-data'
import { AuthControllerContext } from 'lib/components/contextProviders/AuthControllerContextProvider'
import { useMemo } from 'react'
import { useContext } from 'react'

export const usePrizePoolAddresses = () => {
  const { chainId } = useContext(AuthControllerContext)

  return useMemo(() => {
    const addresses = []

    const contracts = contractAddresses[chainId]
    const contractKeys = Object.keys(contracts)

    contractKeys.forEach((key) => {
      if (contracts[key].prizePool) {
        addresses.push(contracts[key].prizePool)
      }
    })

    return addresses
  }, [chainId])
}
